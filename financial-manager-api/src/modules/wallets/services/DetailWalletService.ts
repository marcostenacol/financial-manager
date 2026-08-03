import { injectable, inject } from 'tsyringe';
import { Wallet } from '@prisma/client';
import { CacheTrait } from '@/base/traits/CacheTrait';
import { CacheKeys } from '@/shared/cache/CacheKeys';
import { WalletRepositoryInterface } from '../repositories/contracts/WalletRepositoryInterface';
import { assertOwnership } from '@/shared/authorization/ownership';

@injectable()
export class DetailWalletService {
  constructor(
    @inject('WalletRepository')
    private wallet_repository: WalletRepositoryInterface,
    @inject('CacheTrait')
    private cache: CacheTrait,
  ) {}

  async execute(id: string, user_id: string, organization_ids: string[] = []): Promise<Wallet> {
    const cache_key = CacheKeys.wallets.detail(id);

    const cached = await this.cache.get<Wallet>(cache_key);
    if (cached) {
      assertOwnership(cached, user_id, organization_ids, 'Carteira não encontrada');
      return cached;
    }

    const wallet = await this.wallet_repository.findById(id);

    assertOwnership(wallet, user_id, organization_ids, 'Carteira não encontrada');

    await this.cache.set(cache_key, wallet as Wallet);

    // Em uma implementação futura, poderíamos incluir as últimas transações aqui.
    return wallet as Wallet;
  }
}
