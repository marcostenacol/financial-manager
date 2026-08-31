import { inject, injectable } from 'tsyringe';
import { Prisma, Transaction, ProfileScope } from '@prisma/client';
import { prisma } from '@/shared/database/PrismaClient';
import { PersonRepositoryInterface } from '../repositories/contracts/PersonRepositoryInterface';
import { TransactionRepositoryInterface } from '@/modules/transactions/repositories/contracts/TransactionRepositoryInterface';
import { WalletRepositoryInterface } from '@/modules/wallets/repositories/contracts/WalletRepositoryInterface';
import { CategoryRepositoryInterface } from '@/modules/categories/repositories/contracts/CategoryRepositoryInterface';
import { InvoiceRepositoryInterface } from '@/modules/credit-cards/repositories/contracts/InvoiceRepositoryInterface';
import { resolveInvoiceId } from '@/modules/credit-cards/utils/resolveInvoiceId';
import { SettlePersonDebtDTOType } from '../dtos/SettlePersonDebtDTO';
import { AppError } from '@/shared/errors/AppError';
import { assertOwnership, isOwnedByActor } from '@/shared/authorization/ownership';
import { TransactionStatusEnum } from '@/modules/transactions/enums/TransactionStatusEnum';
import { TransactionTypeEnum } from '@/modules/transactions/enums/TransactionTypeEnum';
import { getCurrentPeriod } from '../utils/currentPeriod';
import { CacheTrait } from '@/base/traits/CacheTrait';
import { CacheKeys } from '@/shared/cache/CacheKeys';
import { resolveOwnerKey } from '@/shared/lib/resolveOwnerKey';

@injectable()
export class SettlePersonDebtService {
  constructor(
    @inject('PersonRepository') private personRepository: PersonRepositoryInterface,
    @inject('TransactionRepository') private transactionRepository: TransactionRepositoryInterface,
    @inject('WalletRepository') private walletRepository: WalletRepositoryInterface,
    @inject('CategoryRepository') private categoryRepository: CategoryRepositoryInterface,
    @inject('InvoiceRepository') private invoiceRepository: InvoiceRepositoryInterface,
    private cache: CacheTrait,
  ) {}

  async execute(id: string, data: SettlePersonDebtDTOType, userId: string, organizationIds: string[] = []): Promise<{ person: unknown; transaction: Transaction }> {
    const person = await this.personRepository.findById(id);
    assertOwnership(person, userId, organizationIds, 'Pessoa não encontrada');

    const amount = data.direction === 'they_owe_me' ? person!.theyOweMe : person!.iOweThem;

    if (new Prisma.Decimal(amount).lessThanOrEqualTo(0)) {
      throw new AppError('Não há valor pendente nessa direção', 422);
    }

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

    const type = data.direction === 'they_owe_me' ? TransactionTypeEnum.INCOME : TransactionTypeEnum.EXPENSE;
    const decimalAmount = new Prisma.Decimal(amount);
    const balanceDelta = type === TransactionTypeEnum.INCOME ? decimalAmount : decimalAmount.negated();
    const description = data.direction === 'they_owe_me'
      ? `Recebimento de ${person!.name}`
      : `Pagamento para ${person!.name}`;

    const isOneTime = person!.paymentFrequency === 'ONE_TIME';

    const { transaction, updatedPerson } = await prisma.$transaction(async (tx) => {
      const occurredAt = new Date();
      const invoiceId = await resolveInvoiceId(wallet, occurredAt, this.invoiceRepository, tx);

      const createdTransaction = await this.transactionRepository.create({
        walletId: data.wallet_id,
        categoryId: data.category_id,
        type,
        amount: decimalAmount,
        description,
        status: TransactionStatusEnum.COMPLETED,
        occurredAt,
        invoiceId,
      }, tx);

      await this.walletRepository.update(wallet.id, {
        balance: { increment: balanceDelta },
      }, tx);

      const settlementFields = data.direction === 'they_owe_me' ? { theyOweMe: 0 } : { iOweThem: 0 };

      const personUpdated = await this.personRepository.update(id, {
        ...(isOneTime ? settlementFields : {}),
        ...(person!.paymentFrequency === 'MONTHLY' ? { lastPaidPeriod: getCurrentPeriod() } : {}),
      }, tx);

      return { transaction: createdTransaction, updatedPerson: personUpdated };
    });

    await this.cache.del(CacheKeys.wallets.detail(wallet.id));
    if (wallet.organizationId) {
      await this.cache.delPattern(CacheKeys.wallets.listAllPattern());
    } else {
      await this.cache.delPattern(CacheKeys.wallets.listPattern(resolveOwnerKey(wallet)));
    }
    await this.cache.delPattern(CacheKeys.transactions.listPattern(userId));
    await this.cache.del(CacheKeys.transactions.byWallet(wallet.id));
    await this.cache.delPattern(CacheKeys.reports.overviewPattern(userId));
    await this.cache.del(CacheKeys.reports.monthlyEvolution(userId));
    await this.cache.delPattern(CacheKeys.reports.expensesByCategoryPattern(userId));
    if (wallet.scope === ProfileScope.business) {
      await this.cache.delPattern(CacheKeys.reports.cashFlowByCostCenterPattern(userId));
    }

    return { person: updatedPerson, transaction };
  }
}
