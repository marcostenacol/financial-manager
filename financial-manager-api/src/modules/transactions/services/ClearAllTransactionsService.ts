import { inject, injectable } from 'tsyringe';
import { prisma } from '@/shared/database/PrismaClient';
import { TransactionRepositoryInterface } from '../repositories/contracts/TransactionRepositoryInterface';
import { WalletRepositoryInterface } from '@/modules/wallets/repositories/contracts/WalletRepositoryInterface';
import { CacheTrait } from '@/base/traits/CacheTrait';
import { CacheKeys } from '@/shared/cache/CacheKeys';

@injectable()
export class ClearAllTransactionsService {
  constructor(
    @inject('TransactionRepository')
    private transactionRepository: TransactionRepositoryInterface,

    @inject('WalletRepository')
    private walletRepository: WalletRepositoryInterface,

    private cache: CacheTrait,
  ) {}

  async execute(userId: string, resetBalances: boolean): Promise<void> {
    const wallets = await this.walletRepository.findAllByUserId(userId);

    await prisma.$transaction(async (tx) => {
      await this.transactionRepository.deleteAllByUserId(userId, tx);

      if (resetBalances) {
        for (const wallet of wallets) {
          await this.walletRepository.update(wallet.id, { balance: 0 }, tx);
        }
      }
    });

    for (const wallet of wallets) {
      await this.cache.delPattern(CacheKeys.transactions.byWalletPattern(wallet.id));
      if (resetBalances) {
        await this.cache.del(CacheKeys.wallets.detail(wallet.id));
      }
    }

    await this.cache.delPattern(CacheKeys.transactions.listPattern(userId));
    await this.cache.delPattern(CacheKeys.reports.overviewPattern(userId));
    await this.cache.del(CacheKeys.reports.monthlyEvolution(userId));
    await this.cache.delPattern(CacheKeys.reports.expensesByCategoryPattern(userId));
    if (resetBalances) {
      await this.cache.del(CacheKeys.wallets.list(userId));
    }
  }
}
