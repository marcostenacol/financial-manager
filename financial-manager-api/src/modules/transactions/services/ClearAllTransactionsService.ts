import { inject, injectable } from 'tsyringe';
import { prisma } from '@/shared/database/PrismaClient';
import { TransactionRepositoryInterface } from '../repositories/contracts/TransactionRepositoryInterface';
import { WalletRepositoryInterface } from '@/modules/wallets/repositories/contracts/WalletRepositoryInterface';
import { OrganizationMemberRepositoryInterface } from '@/modules/organizations/repositories/contracts/OrganizationMemberRepositoryInterface';
import { AppError } from '@/shared/errors/AppError';
import { CacheTrait } from '@/base/traits/CacheTrait';
import { CacheKeys } from '@/shared/cache/CacheKeys';

@injectable()
export class ClearAllTransactionsService {
  constructor(
    @inject('TransactionRepository')
    private transactionRepository: TransactionRepositoryInterface,

    @inject('WalletRepository')
    private walletRepository: WalletRepositoryInterface,

    @inject('OrganizationMemberRepository')
    private organizationMemberRepository: OrganizationMemberRepositoryInterface,

    private cache: CacheTrait,
  ) {}

  /**
   * `organizationId` decide o alvo real da limpeza — sem isso, "Zerar tudo" clicado na aba
   * Empresarial acabava apagando as transações PESSOAIS do usuário (o service sempre operou
   * por `userId`, ignorando por completo o escopo ativo na tela).
   */
  async execute(userId: string, resetBalances: boolean, organizationId?: string): Promise<void> {
    if (organizationId) {
      const membership = await this.organizationMemberRepository.findByOrganizationAndUser(organizationId, userId);
      if (!membership) {
        throw new AppError('Você não faz parte desta organização', 403);
      }

      await this.clearOrganization(organizationId, resetBalances);
      return;
    }

    await this.clearPersonal(userId, resetBalances);
  }

  private async clearPersonal(userId: string, resetBalances: boolean): Promise<void> {
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
      await this.cache.delPattern(CacheKeys.wallets.listPattern(userId));
    }
  }

  private async clearOrganization(organizationId: string, resetBalances: boolean): Promise<void> {
    const wallets = await this.walletRepository.findAllByOrganizationId(organizationId);

    await prisma.$transaction(async (tx) => {
      await this.transactionRepository.deleteAllByOrganizationId(organizationId, tx);

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
  }
}
