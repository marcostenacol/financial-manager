import { inject, injectable } from 'tsyringe';
import { Prisma, Transaction, ProfileScope } from '@prisma/client';
import { prisma } from '@/shared/database/PrismaClient';
import { TransactionRepositoryInterface } from '../repositories/contracts/TransactionRepositoryInterface';
import { WalletRepositoryInterface } from '@/modules/wallets/repositories/contracts/WalletRepositoryInterface';
import { CategoryRepositoryInterface } from '@/modules/categories/repositories/contracts/CategoryRepositoryInterface';
import { CostCenterRepositoryInterface } from '@/modules/cost-centers/repositories/contracts/CostCenterRepositoryInterface';
import { PersonRepositoryInterface } from '@/modules/people/repositories/contracts/PersonRepositoryInterface';
import { InvoiceRepositoryInterface } from '@/modules/credit-cards/repositories/contracts/InvoiceRepositoryInterface';
import { computeInvoicePeriod } from '@/modules/credit-cards/utils/computeInvoicePeriod';
import { WalletTypeEnum } from '@/modules/wallets/enums/WalletTypeEnum';
import { CreateTransactionDTOType } from '../dtos/CreateTransactionDTO';
import { AppError } from '@/shared/errors/AppError';
import { TransactionStatusEnum } from '../enums/TransactionStatusEnum';
import { TransactionTypeEnum } from '../enums/TransactionTypeEnum';
import { CacheTrait } from '@/base/traits/CacheTrait';
import { CacheKeys } from '@/shared/cache/CacheKeys';
import { isOwnedByActor } from '@/shared/authorization/ownership';
import { resolveOwnerKey } from '@/shared/lib/resolveOwnerKey';

@injectable()
export class CreateTransactionService {
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

  async execute(data: CreateTransactionDTOType, userId: string, organizationIds: string[] = []): Promise<Transaction | Transaction[]> {
    const wallet = await this.walletRepository.findById(data.wallet_id);

    if (!wallet || !isOwnedByActor(wallet, userId, organizationIds)) {
      throw new AppError('Carteira não encontrada', 404);
    }

    const category = await this.categoryRepository.findById(data.category_id);

    if (!category) {
      throw new AppError('Categoria não encontrada', 404);
    }

    if (category.scope && category.scope !== wallet.scope) {
      throw new AppError('Esta categoria não é compatível com o escopo da carteira', 422);
    }

    if (data.cost_center_id && wallet.scope !== ProfileScope.business) {
      throw new AppError('Centro de custo só pode ser usado em carteiras empresariais', 422);
    }

    if (data.cost_center_id) {
      const costCenter = await this.costCenterRepository.findById(data.cost_center_id);

      if (!costCenter || costCenter.userId !== userId) {
        throw new AppError('Centro de custo não encontrado', 404);
      }
    }

    if (data.person_id && data.type !== TransactionTypeEnum.EXPENSE) {
      throw new AppError('Só é possível vincular uma pessoa a uma despesa', 422);
    }

    if (data.person_id) {
      const person = await this.personRepository.findById(data.person_id);

      if (!person || !isOwnedByActor(person, userId, organizationIds)) {
        throw new AppError('Pessoa não encontrada', 404);
      }

      if (person.scope !== wallet.scope) {
        throw new AppError('Esta pessoa não é compatível com o escopo da carteira', 422);
      }
    }

    const installmentCount = data.installments ?? 1;

    // Divide o valor total em N parcelas iguais, absorvendo o resto do arredondamento
    // na última parcela para que a soma bata exatamente com o valor total da compra.
    const installmentAmounts: Prisma.Decimal[] = [];
    if (installmentCount > 1) {
      const totalCents = new Prisma.Decimal(data.amount).times(100).round();
      const baseCents = totalCents.dividedBy(installmentCount).floor();
      const remainderCents = totalCents.minus(baseCents.times(installmentCount));
      for (let i = 0; i < installmentCount; i++) {
        const cents = i === installmentCount - 1 ? baseCents.plus(remainderCents) : baseCents;
        installmentAmounts.push(cents.dividedBy(100));
      }
    } else {
      installmentAmounts.push(new Prisma.Decimal(data.amount));
    }

    const baseOccurredAt = new Date(data.occurred_at);

    const transaction = await prisma.$transaction(async (tx) => {
      const createdTransactions: Transaction[] = [];

      for (let i = 0; i < installmentAmounts.length; i++) {
        const installmentAmount = installmentAmounts[i] as Prisma.Decimal;
        // Só a primeira parcela é o status pedido (normalmente "efetivada", já que a compra
        // já aconteceu); as parcelas futuras entram como "pendente" — ainda não saíram do
        // bolso, só vão virar cobrança de fato quando a fatura daquele mês chegar.
        const status = i === 0 ? data.status : TransactionStatusEnum.PENDING;
        const isCompleted = status === TransactionStatusEnum.COMPLETED;
        const balanceDelta = data.type === TransactionTypeEnum.INCOME ? installmentAmount : installmentAmount.negated();
        const affectsPersonDebt = isCompleted && !!data.person_id;

        const occurredAt = new Date(baseOccurredAt);
        occurredAt.setMonth(occurredAt.getMonth() + i);

        const description = installmentCount > 1
          ? `${data.description ?? 'Compra parcelada'} (${i + 1}/${installmentCount})`
          : data.description;

        let invoiceId: string | undefined;
        if (wallet.type === WalletTypeEnum.CREDIT) {
          const period = computeInvoicePeriod(occurredAt, wallet.closingDay ?? 1, wallet.dueDay ?? 10);
          const invoice = await this.invoiceRepository.findOrCreate(wallet.id, period, tx);
          invoiceId = invoice.id;
        }

        const createdTransaction = await this.transactionRepository.create({
          walletId: data.wallet_id,
          categoryId: data.category_id,
          type: data.type,
          amount: installmentAmount,
          description,
          status,
          occurredAt,
          costCenterId: data.cost_center_id,
          personId: data.person_id,
          invoiceId,
        }, tx);

        if (isCompleted) {
          await this.walletRepository.update(wallet.id, {
            balance: { increment: balanceDelta },
          }, tx);
        }

        if (affectsPersonDebt) {
          await this.personRepository.update(data.person_id as string, {
            theyOweMe: { increment: installmentAmount },
          }, tx);
        }

        createdTransactions.push(createdTransaction);
      }

      return createdTransactions;
    });

    const isCompleted = transaction[0]?.status === TransactionStatusEnum.COMPLETED;

    if (isCompleted) {
      // Invalida cache da carteira e lista de carteiras
      await this.cache.del(CacheKeys.wallets.detail(wallet.id));
      if (wallet.organizationId) {
        await this.cache.delPattern(CacheKeys.wallets.listAllPattern());
      } else {
        await this.cache.delPattern(CacheKeys.wallets.listPattern(resolveOwnerKey(wallet)));
      }
    }

    // Invalida cache de transações
    await this.cache.del(CacheKeys.transactions.byWallet(wallet.id));
    await this.cache.delPattern(CacheKeys.transactions.listPattern(userId));
    await this.cache.delPattern(CacheKeys.reports.overviewPattern(userId));
    await this.cache.del(CacheKeys.reports.monthlyEvolution(userId));
    await this.cache.delPattern(CacheKeys.reports.expensesByCategoryPattern(userId));
    await this.cache.delPattern(CacheKeys.reports.cashFlowByCostCenterPattern(userId));

    return installmentCount > 1 ? transaction : (transaction[0] as Transaction);
  }
}
