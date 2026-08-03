import { injectable, inject } from 'tsyringe';
import { Wallet, ProfileScope } from '@prisma/client';
import { CacheTrait } from '@/base/traits/CacheTrait';
import { CacheKeys } from '@/shared/cache/CacheKeys';
import { WalletRepositoryInterface } from '../repositories/contracts/WalletRepositoryInterface';

@injectable()
export class ListWalletsService {
  constructor(
    @inject('WalletRepository')
    private wallet_repository: WalletRepositoryInterface,
    @inject('CacheTrait')
    private cache: CacheTrait,
  ) {}

  async execute(user_id: string, scope?: ProfileScope, organization_ids: string[] = []): Promise<Wallet[]> {
    // Membro de organização: dado compartilhado entre usuários, não cacheado
    // (evitaria invalidar o cache de todo membro sempre que alguém mais mexer na carteira da organização).
    if (organization_ids.length > 0) {
      return this.wallet_repository.findAllByOwner(user_id, organization_ids, scope);
    }

    const cache_key = CacheKeys.wallets.list(user_id, scope);

    const cached = await this.cache.get<Wallet[]>(cache_key);
    if (cached) return cached;

    const wallets = await this.wallet_repository.findAllByUserId(user_id, scope);

    await this.cache.set(cache_key, wallets, 300);

    return wallets;
  }
}
