import { injectable, inject } from 'tsyringe';
import { Wallet } from '@prisma/client';
import { CacheTrait } from '@/base/traits/CacheTrait';
import { WalletRepositoryInterface } from '../repositories/contracts/WalletRepositoryInterface';

interface CreateWalletDTO {
  user_id: string;
  name: string;
  balance?: number;
}

@injectable()
export class CreateWalletService {
  constructor(
    @inject('WalletRepository')
    private wallet_repository: WalletRepositoryInterface,
    @inject('CacheTrait')
    private cache: CacheTrait,
  ) {}

  async execute(data: CreateWalletDTO): Promise<Wallet> {
    const wallet = await this.wallet_repository.create(data);

    // Invalida cache de listagem
    await this.cache.del(`wallets:user:${data.user_id}`);

    return wallet;
  }
}
