import { injectable, inject } from 'tsyringe';
import { Wallet } from '@prisma/client';
import { AppError } from '@/shared/errors/AppError';
import { WalletRepositoryInterface } from '../repositories/contracts/WalletRepositoryInterface';

@injectable()
export class DetailWalletService {
  constructor(
    @inject('WalletRepository')
    private wallet_repository: WalletRepositoryInterface,
  ) {}

  async execute(id: string, user_id: string): Promise<Wallet> {
    const wallet = await this.wallet_repository.findById(id);

    if (!wallet || wallet.userId !== user_id) {
      throw new AppError('Carteira não encontrada', 404);
    }

    // Em uma implementação futura, poderíamos incluir as últimas transações aqui.
    return wallet;
  }
}
