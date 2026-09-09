import { inject, injectable } from 'tsyringe';
import { Prisma } from '@prisma/client';
import { prisma } from '@/shared/database/PrismaClient';
import { TransactionRepositoryInterface } from '../repositories/contracts/TransactionRepositoryInterface';
import { WalletRepositoryInterface } from '@/modules/wallets/repositories/contracts/WalletRepositoryInterface';
import { PersonRepositoryInterface } from '@/modules/people/repositories/contracts/PersonRepositoryInterface';
import { AppError } from '@/shared/errors/AppError';
import { TransactionStatusEnum } from '../enums/TransactionStatusEnum';
import { TransactionTypeEnum } from '../enums/TransactionTypeEnum';
import { CacheTrait } from '@/base/traits/CacheTrait';
import { CacheKeys } from '@/shared/cache/CacheKeys';
import { isOwnedByActor } from '@/shared/authorization/ownership';
import { resolveOwnerKey } from '@/shared/lib/resolveOwnerKey';

@injectable()
export class DeleteTransactionService {
  constructor(
    @inject('TransactionRepository')
    private transactionRepository: TransactionRepositoryInterface,

    @inject('WalletRepository')
    private walletRepository: WalletRepositoryInterface,

    @inject('PersonRepository')
    private personRepository: PersonRepositoryInterface,

    private cache: CacheTrait,
  ) {}

  async execute(id: string, userId: string, organizationIds: string[] = []): Promise<void> {
    const transaction = await this.transactionRepository.findById(id);

    if (!transaction) {
      throw new AppError('Transação não encontrada', 404);
    }

    const wallet = await this.walletRepository.findById(transaction.walletId);

    if (!wallet || !isOwnedByActor(wallet, userId, organizationIds)) {
      throw new AppError('Acesso negado', 403);
    }

    const wasCompleted = transaction.status === TransactionStatusEnum.COMPLETED;
    const signedAmount = transaction.type === TransactionTypeEnum.INCOME
      ? new Prisma.Decimal(transaction.amount)
      : new Prisma.Decimal(transaction.amount).negated();

    const hadPersonDebt = wasCompleted && !!transaction.personId && transaction.type === TransactionTypeEnum.EXPENSE;

    await prisma.$transaction(async (tx) => {
      // Se estava concluída, reverte o impacto no saldo (delta invertido)
      if (wasCompleted) {
        await this.walletRepository.update(wallet.id, {
          balance: { increment: signedAmount.negated() },
        }, tx);
      }

      if (hadPersonDebt) {
        await this.personRepository.update(transaction.personId as string, {
          theyOweMe: { decrement: transaction.amount },
        }, tx);
      }

      await this.transactionRepository.delete(id, tx);
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
  }
}
