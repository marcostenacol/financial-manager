import { injectable, inject } from 'tsyringe';
import { Wallet } from '@prisma/client';
import { AppError } from '@/shared/errors/AppError';
import { CacheTrait } from '@/base/traits/CacheTrait';
import { WalletRepositoryInterface } from '../repositories/contracts/WalletRepositoryInterface';

interface UpdateWalletDTO {
  id: string;
  user_id: string;
  name?: string;
  balance?: number;
}

@injectable()
export class UpdateWalletService {
  constructor(
    @inject('WalletRepository')
    private wallet_repository: WalletRepositoryInterface,
    @inject('CacheTrait')
    private cache: CacheTrait,
  ) {}

  async execute({ id, user_id, ...data }: UpdateWalletDTO): Promise<Wallet> {
    const wallet = await this.wallet_repository.findById(id);

    if (!wallet || wallet.userId !== user_id) {
      throw new AppError('Carteira não encontrada', 404);
    }

    const updated_wallet = await this.wallet_repository.update(id, data);

    // Invalida cache
    await this.cache.del(`wallets:user:${user_id}`);
    await this.cache.del(`wallet:detail:${id}`);

    return updated_wallet;
  }
}
