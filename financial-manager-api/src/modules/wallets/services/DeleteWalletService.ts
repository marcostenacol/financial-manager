import { injectable, inject } from 'tsyringe';
import { AppError } from '@/shared/errors/AppError';
import { CacheTrait } from '@/base/traits/CacheTrait';
import { CacheKeys } from '@/shared/cache/CacheKeys';
import { WalletRepositoryInterface } from '../repositories/contracts/WalletRepositoryInterface';

@injectable()
export class DeleteWalletService {
  constructor(
    @inject('WalletRepository')
    private wallet_repository: WalletRepositoryInterface,
    @inject('CacheTrait')
    private cache: CacheTrait,
  ) {}

  async execute(id: string, user_id: string): Promise<void> {
    const wallet = await this.wallet_repository.findById(id);

    if (!wallet || wallet.userId !== user_id) {
      throw new AppError('Carteira não encontrada', 404);
    }

    await this.wallet_repository.delete(id);

    // Invalida cache
    await this.cache.del(CacheKeys.wallets.list(user_id));
    await this.cache.del(CacheKeys.wallets.detail(id));
  }
}
