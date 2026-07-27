import { injectable, inject } from 'tsyringe';
import { Wallet, Prisma } from '@prisma/client';
import { CacheTrait } from '@/base/traits/CacheTrait';
import { WalletRepositoryInterface } from '../repositories/contracts/WalletRepositoryInterface';

interface CreateWalletDTO {
  user_id: string;
  name: string;
  type: string;
  balance?: number;
  currency?: string;
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
    const wallet = await this.wallet_repository.create({
      userId: data.user_id,
      name: data.name,
      type: data.type,
      balance: new Prisma.Decimal(data.balance ?? 0),
      currency: data.currency,
    });

    // Invalida cache de listagem
    await this.cache.del(`wallets:user:${data.user_id}`);

    return wallet;
  }
}
