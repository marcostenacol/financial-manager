import { inject, injectable } from 'tsyringe';
import { prisma } from '@/shared/database/PrismaClient';
import { WalletRepositoryInterface } from '../repositories/contracts/WalletRepositoryInterface';
import { TransactionRepositoryInterface } from '@/modules/transactions/repositories/contracts/TransactionRepositoryInterface';
import { RecurrenceRepositoryInterface } from '@/modules/recurrences/repositories/contracts/RecurrenceRepositoryInterface';
import { CacheTrait } from '@/base/traits/CacheTrait';
import { CacheKeys } from '@/shared/cache/CacheKeys';

@injectable()
export class ClearAllWalletsService {
  constructor(
    @inject('WalletRepository')
    private walletRepository: WalletRepositoryInterface,

    @inject('TransactionRepository')
    private transactionRepository: TransactionRepositoryInterface,

    @inject('RecurrenceRepository')
    private recurrenceRepository: RecurrenceRepositoryInterface,

    private cache: CacheTrait,
  ) {}

  async execute(userId: string): Promise<void> {
    const wallets = await this.walletRepository.findAllByUserId(userId);

    await prisma.$transaction(async (tx) => {
      // Transações e recorrências têm FK RESTRICT para wallet — precisam
      // ser removidas antes, senão a exclusão das carteiras quebra com P2003.
      await this.transactionRepository.deleteAllByUserId(userId, tx);
      await this.recurrenceRepository.deleteAllByUserId(userId, tx);
      await this.walletRepository.deleteAllByUserId(userId, tx);
    });

    for (const wallet of wallets) {
      await this.cache.del(CacheKeys.wallets.detail(wallet.id));
      await this.cache.delPattern(CacheKeys.transactions.byWalletPattern(wallet.id));
    }

    await this.cache.delPattern(CacheKeys.wallets.listPattern(userId));
    await this.cache.del(CacheKeys.recurrences.list(userId));
    await this.cache.delPattern(CacheKeys.transactions.listPattern(userId));
    await this.cache.delPattern(CacheKeys.reports.overviewPattern(userId));
    await this.cache.del(CacheKeys.reports.monthlyEvolution(userId));
    await this.cache.delPattern(CacheKeys.reports.expensesByCategoryPattern(userId));
  }
}
