import { injectable, inject } from 'tsyringe';
import { Wallet } from '@prisma/client';
import { AppError } from '@/shared/errors/AppError';
import { CacheTrait } from '@/base/traits/CacheTrait';
import { CacheKeys } from '@/shared/cache/CacheKeys';
import { WalletRepositoryInterface } from '../repositories/contracts/WalletRepositoryInterface';
import { OrganizationMemberRepositoryInterface } from '@/modules/organizations/repositories/contracts/OrganizationMemberRepositoryInterface';

@injectable()
export class MoveWalletToOrganizationService {
  constructor(
    @inject('WalletRepository')
    private wallet_repository: WalletRepositoryInterface,
    @inject('OrganizationMemberRepository')
    private organization_member_repository: OrganizationMemberRepositoryInterface,
    @inject('CacheTrait')
    private cache: CacheTrait,
  ) {}

  async execute(id: string, organization_id: string, user_id: string): Promise<Wallet> {
    const wallet = await this.wallet_repository.findById(id);

    if (!wallet || wallet.userId !== user_id) {
      throw new AppError('Carteira não encontrada', 404);
    }

    const membership = await this.organization_member_repository.findByOrganizationAndUser(organization_id, user_id);

    if (!membership) {
      throw new AppError('Você não faz parte desta organização', 403);
    }

    // scope precisa virar 'business' junto com a mudança de dono — senão a carteira continua
    // 'personal' mesmo pertencendo à organização, e some silenciosamente da visão pessoal (junto
    // com as transações lançadas nela) sem nunca aparecer corretamente na visão empresarial.
    const updated_wallet = await this.wallet_repository.update(id, {
      userId: null,
      organizationId: organization_id,
      scope: 'business',
    });

    await this.cache.delPattern(CacheKeys.wallets.listPattern(user_id));
    await this.cache.delPattern(CacheKeys.wallets.listAllPattern());
    await this.cache.del(CacheKeys.wallets.detail(id));

    return updated_wallet;
  }
}
