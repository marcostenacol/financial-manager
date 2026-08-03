import { injectable, inject } from 'tsyringe';
import { Wallet, Prisma } from '@prisma/client';
import { CacheTrait } from '@/base/traits/CacheTrait';
import { CacheKeys } from '@/shared/cache/CacheKeys';
import { WalletRepositoryInterface } from '../repositories/contracts/WalletRepositoryInterface';
import { OrganizationMemberRepositoryInterface } from '@/modules/organizations/repositories/contracts/OrganizationMemberRepositoryInterface';
import { CreateWalletDTOType } from '../dtos/CreateWalletDTO';
import { AppError } from '@/shared/errors/AppError';

type CreateWalletServiceInput = CreateWalletDTOType & { user_id: string };

@injectable()
export class CreateWalletService {
  constructor(
    @inject('WalletRepository')
    private wallet_repository: WalletRepositoryInterface,
    @inject('OrganizationMemberRepository')
    private organization_member_repository: OrganizationMemberRepositoryInterface,
    @inject('CacheTrait')
    private cache: CacheTrait,
  ) {}

  async execute(data: CreateWalletServiceInput): Promise<Wallet> {
    if (data.organization_id) {
      const membership = await this.organization_member_repository.findByOrganizationAndUser(data.organization_id, data.user_id);

      if (!membership) {
        throw new AppError('Você não faz parte desta organização', 403);
      }
    }

    const wallet = await this.wallet_repository.create({
      userId: data.organization_id ? null : data.user_id,
      organizationId: data.organization_id ?? null,
      name: data.name,
      type: data.type,
      scope: data.scope,
      balance: new Prisma.Decimal(data.balance ?? 0),
      currency: data.currency,
    });

    // Invalida cache de listagem — se for carteira de organização, todos os membros podem ter cache próprio afetado
    if (data.organization_id) {
      await this.cache.delPattern(CacheKeys.wallets.listAllPattern());
    } else {
      await this.cache.delPattern(CacheKeys.wallets.listPattern(data.user_id));
    }
    await this.cache.delPattern(CacheKeys.reports.overviewPattern(data.user_id));

    return wallet;
  }
}
