import { inject, injectable } from 'tsyringe';
import { Transaction, Prisma, ProfileScope } from '@prisma/client';
import { prisma } from '@/shared/database/PrismaClient';
import { TransactionRepositoryInterface } from '../repositories/contracts/TransactionRepositoryInterface';
import { WalletRepositoryInterface } from '@/modules/wallets/repositories/contracts/WalletRepositoryInterface';
import { CategoryRepositoryInterface } from '@/modules/categories/repositories/contracts/CategoryRepositoryInterface';
import { CostCenterRepositoryInterface } from '@/modules/cost-centers/repositories/contracts/CostCenterRepositoryInterface';
import { PersonRepositoryInterface } from '@/modules/people/repositories/contracts/PersonRepositoryInterface';
import { InvoiceRepositoryInterface } from '@/modules/credit-cards/repositories/contracts/InvoiceRepositoryInterface';
import { computeInvoicePeriod } from '@/modules/credit-cards/utils/computeInvoicePeriod';
import { WalletTypeEnum } from '@/modules/wallets/enums/WalletTypeEnum';
import { UpdateTransactionDTOType } from '../dtos/UpdateTransactionDTO';
import { AppError } from '@/shared/errors/AppError';
import { TransactionStatusEnum } from '../enums/TransactionStatusEnum';
import { TransactionTypeEnum } from '../enums/TransactionTypeEnum';
import { CacheTrait } from '@/base/traits/CacheTrait';
import { CacheKeys } from '@/shared/cache/CacheKeys';
import { isOwnedByActor } from '@/shared/authorization/ownership';
import { resolveOwnerKey } from '@/shared/lib/resolveOwnerKey';

@injectable()
export class UpdateTransactionService {
  constructor(
    @inject('TransactionRepository')
    private transactionRepository: TransactionRepositoryInterface,

    @inject('WalletRepository')
    private walletRepository: WalletRepositoryInterface,

    @inject('CategoryRepository')
    private categoryRepository: CategoryRepositoryInterface,

    @inject('CostCenterRepository')
    private costCenterRepository: CostCenterRepositoryInterface,

    @inject('PersonRepository')
    private personRepository: PersonRepositoryInterface,

    @inject('InvoiceRepository')
    private invoiceRepository: InvoiceRepositoryInterface,

    private cache: CacheTrait,
  ) {}

  async execute(id: string, data: UpdateTransactionDTOType, userId: string, organizationIds: string[] = []): Promise<Transaction> {
    const transaction = await this.transactionRepository.findById(id);

    if (!transaction) {
      throw new AppError('Transação não encontrada', 404);
    }

    const wallet = await this.walletRepository.findById(transaction.walletId);

    if (!wallet || !isOwnedByActor(wallet, userId, organizationIds)) {
      throw new AppError('Acesso negado', 403);
    }

    if (data.category_id) {
      const category = await this.categoryRepository.findById(data.category_id);

      if (!category) {
        throw new AppError('Categoria não encontrada', 404);
      }

      if (category.scope && category.scope !== wallet.scope) {
        throw new AppError('Esta categoria não é compatível com o escopo da carteira', 422);
      }
    }

    if (data.cost_center_id) {
      if (wallet.scope !== ProfileScope.business) {
        throw new AppError('Centro de custo só pode ser usado em carteiras empresariais', 422);
      }

      const costCenter = await this.costCenterRepository.findById(data.cost_center_id);

      if (!costCenter || costCenter.userId !== userId) {
        throw new AppError('Centro de custo não encontrado', 404);
      }
    }

    const wasCompleted = transaction.status === TransactionStatusEnum.COMPLETED;
    const oldSignedAmount = transaction.type === TransactionTypeEnum.INCOME
      ? new Prisma.Decimal(transaction.amount)
      : new Prisma.Decimal(transaction.amount).negated();

    const newType = data.type ?? transaction.type;
    const newAmount = data.amount !== undefined ? new Prisma.Decimal(data.amount) : new Prisma.Decimal(transaction.amount);
    const newStatus = data.status ?? transaction.status;
    const willBeCompleted = newStatus === TransactionStatusEnum.COMPLETED;
    const newSignedAmount = newType === TransactionTypeEnum.INCOME ? newAmount : newAmount.negated();

    // Delta líquido: remove o impacto antigo (se estava concluída) e aplica o novo (se ficará concluída)
    const balanceDelta = (willBeCompleted ? newSignedAmount : new Prisma.Decimal(0))
      .minus(wasCompleted ? oldSignedAmount : new Prisma.Decimal(0));

    const oldPersonId = transaction.personId;
    const newPersonId = data.person_id !== undefined ? data.person_id : oldPersonId;

    if (newPersonId && newType !== TransactionTypeEnum.EXPENSE) {
      throw new AppError('Só é possível vincular uma pessoa a uma despesa', 422);
    }

    if (newPersonId && newPersonId !== oldPersonId) {
      const person = await this.personRepository.findById(newPersonId);

      if (!person || !isOwnedByActor(person, userId, organizationIds)) {
        throw new AppError('Pessoa não encontrada', 404);
      }

      if (person.scope !== wallet.scope) {
        throw new AppError('Esta pessoa não é compatível com o escopo da carteira', 422);
      }
    }

    // Dívida antiga só existiu de fato se a transação estava concluída, era despesa e tinha pessoa vinculada
    const oldPersonDebt = (wasCompleted && oldPersonId && transaction.type === TransactionTypeEnum.EXPENSE)
      ? new Prisma.Decimal(transaction.amount)
      : new Prisma.Decimal(0);
    const newPersonDebt = (willBeCompleted && newPersonId && newType === TransactionTypeEnum.EXPENSE)
      ? newAmount
      : new Prisma.Decimal(0);

    const updatedTransaction = await prisma.$transaction(async (tx) => {
      const effectiveOccurredAt = data.occurred_at ? new Date(data.occurred_at) : transaction.occurredAt;

      let invoiceId: string | undefined;
      if (wallet.type === WalletTypeEnum.CREDIT) {
        const period = computeInvoicePeriod(effectiveOccurredAt, wallet.closingDay ?? 1, wallet.dueDay ?? 10);
        const invoice = await this.invoiceRepository.findOrCreate(wallet.id, period, tx);
        invoiceId = invoice.id;
      }

      const updated = await this.transactionRepository.update(id, {
        description: data.description,
        amount: data.amount,
        type: data.type,
        status: data.status,
        categoryId: data.category_id,
        occurredAt: data.occurred_at ? new Date(data.occurred_at) : undefined,
        costCenterId: data.cost_center_id,
        personId: data.person_id,
        invoiceId,
      }, tx);

      if (!balanceDelta.isZero()) {
        await this.walletRepository.update(wallet.id, {
          balance: { increment: balanceDelta },
        }, tx);
      }

      if (oldPersonId && newPersonId === oldPersonId) {
        const personDelta = newPersonDebt.minus(oldPersonDebt);
        if (!personDelta.isZero()) {
          await this.personRepository.update(oldPersonId, { theyOweMe: { increment: personDelta } }, tx);
        }
      } else {
        if (oldPersonId && !oldPersonDebt.isZero()) {
          await this.personRepository.update(oldPersonId, { theyOweMe: { decrement: oldPersonDebt } }, tx);
        }
        if (newPersonId && !newPersonDebt.isZero()) {
          await this.personRepository.update(newPersonId, { theyOweMe: { increment: newPersonDebt } }, tx);
        }
      }

      return updated;
    });

    // Invalida caches (incluindo listagens filtradas)
    await this.cache.del(CacheKeys.wallets.detail(wallet.id));
    if (wallet.organizationId) {
      await this.cache.delPattern(CacheKeys.wallets.listAllPattern());
    } else {
      await this.cache.delPattern(CacheKeys.wallets.listPattern(resolveOwnerKey(wallet)));
    }
    await this.cache.del(CacheKeys.transactions.detail(id));
    await this.cache.delPattern(CacheKeys.transactions.listPattern(userId));
    await this.cache.delPattern(CacheKeys.transactions.byWalletPattern(wallet.id));
    await this.cache.delPattern(CacheKeys.reports.overviewPattern(userId));
    await this.cache.del(CacheKeys.reports.monthlyEvolution(userId));
    await this.cache.delPattern(CacheKeys.reports.expensesByCategoryPattern(userId));
    await this.cache.delPattern(CacheKeys.reports.cashFlowByCostCenterPattern(userId));

    return updatedTransaction;
  }
}
