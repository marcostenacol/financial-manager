import { injectable, inject } from 'tsyringe';
import { Wallet } from '@prisma/client';
import { AppError } from '@/shared/errors/AppError';
import { CacheTrait } from '@/base/traits/CacheTrait';
import { WalletRepositoryInterface } from '../repositories/contracts/WalletRepositoryInterface';

@injectable()
export class DetailWalletService {
  constructor(
    @inject('WalletRepository')
    private wallet_repository: WalletRepositoryInterface,
    @inject('CacheTrait')
    private cache: CacheTrait,
  ) {}

  async execute(id: string, user_id: string): Promise<Wallet> {
    const cache_key = `wallet:detail:${id}`;

    const cached = await this.cache.get<Wallet>(cache_key);
    if (cached) {
      if (cached.userId !== user_id) {
        throw new AppError('Carteira não encontrada', 404);
      }
      return cached;
    }

    const wallet = await this.wallet_repository.findById(id);

    if (!wallet || wallet.userId !== user_id) {
      throw new AppError('Carteira não encontrada', 404);
    }

    await this.cache.set(cache_key, wallet);

    // Em uma implementação futura, poderíamos incluir as últimas transações aqui.
    return wallet;
  }
}
