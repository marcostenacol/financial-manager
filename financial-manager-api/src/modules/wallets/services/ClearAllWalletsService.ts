import { inject, injectable } from 'tsyringe';
import { prisma } from '@/shared/database/PrismaClient';
import { WalletRepositoryInterface } from '../repositories/contracts/WalletRepositoryInterface';
import { TransactionRepositoryInterface } from '@/modules/transactions/repositories/contracts/TransactionRepositoryInterface';
import { RecurrenceRepositoryInterface } from '@/modules/recurrences/repositories/contracts/RecurrenceRepositoryInterface';
import { OrganizationMemberRepositoryInterface } from '@/modules/organizations/repositories/contracts/OrganizationMemberRepositoryInterface';
import { AppError } from '@/shared/errors/AppError';
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

    @inject('OrganizationMemberRepository')
    private organizationMemberRepository: OrganizationMemberRepositoryInterface,

    private cache: CacheTrait,
  ) {}

  /**
   * `organizationId` decide o alvo real da limpeza — sem isso, "Zerar tudo" clicado na aba
   * Empresarial acabava apagando as carteiras/transações/recorrências PESSOAIS do usuário
   * (o service sempre operou por `userId`, ignorando por completo o escopo ativo na tela).
   */
  async execute(userId: string, organizationId?: string): Promise<void> {
    if (organizationId) {
      const membership = await this.organizationMemberRepository.findByOrganizationAndUser(organizationId, userId);
      if (!membership) {
        throw new AppError('Você não faz parte desta organização', 403);
      }

      await this.clearOrganization(organizationId);
      return;
    }

    await this.clearPersonal(userId);
  }

  private async clearPersonal(userId: string): Promise<void> {
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

  private async clearOrganization(organizationId: string): Promise<void> {
    const wallets = await this.walletRepository.findAllByOrganizationId(organizationId);

    await prisma.$transaction(async (tx) => {
      await this.transactionRepository.deleteAllByOrganizationId(organizationId, tx);
      await this.recurrenceRepository.deleteAllByOrganizationId(organizationId, tx);
      await this.walletRepository.deleteAllByOrganizationId(organizationId, tx);
    });

    // Dado de organização é compartilhado entre membros e por isso não é cacheado na leitura
    // (ver ListWalletsService/ListTransactionsService) — só o cache por-carteira precisa ser
    // invalidado aqui.
    for (const wallet of wallets) {
      await this.cache.del(CacheKeys.wallets.detail(wallet.id));
      await this.cache.delPattern(CacheKeys.transactions.byWalletPattern(wallet.id));
    }
  }
}
