import { injectable, inject } from 'tsyringe';
import { Wallet } from '@prisma/client';
import { AppError } from '@/shared/errors/AppError';
import { CacheTrait } from '@/base/traits/CacheTrait';
import { CacheKeys } from '@/shared/cache/CacheKeys';
import { WalletRepositoryInterface } from '../repositories/contracts/WalletRepositoryInterface';

@injectable()
export class SetPrimaryWalletService {
  constructor(
    @inject('WalletRepository')
    private wallet_repository: WalletRepositoryInterface,
    @inject('CacheTrait')
    private cache: CacheTrait,
  ) {}

  async execute(id: string, user_id: string): Promise<Wallet> {
    const wallet = await this.wallet_repository.findById(id);

    if (!wallet || wallet.userId !== user_id) {
      throw new AppError('Carteira não encontrada', 404);
    }

    const previous_primary_wallets = await this.wallet_repository.findAllByUserId(user_id, wallet.scope);
    const previous_primary = previous_primary_wallets.find((w) => w.isPrimary);

    const updated_wallet = await this.wallet_repository.setPrimary(id, user_id, wallet.scope);

    await this.cache.delPattern(CacheKeys.wallets.listPattern(user_id));
    await this.cache.del(CacheKeys.wallets.detail(id));

    if (previous_primary && previous_primary.id !== id) {
      await this.cache.del(CacheKeys.wallets.detail(previous_primary.id));
    }

    return updated_wallet;
  }
}
