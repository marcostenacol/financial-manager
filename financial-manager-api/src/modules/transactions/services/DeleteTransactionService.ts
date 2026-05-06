import { inject, injectable } from 'tsyringe';
import { TransactionRepositoryInterface } from '../repositories/contracts/TransactionRepositoryInterface';
import { WalletRepositoryInterface } from '@/modules/wallets/repositories/contracts/WalletRepositoryInterface';
import { AppError } from '@/shared/errors/AppError';
import { TransactionStatusEnum } from '../enums/TransactionStatusEnum';
import { TransactionTypeEnum } from '../enums/TransactionTypeEnum';
import { CacheTrait } from '@/base/traits/CacheTrait';

@injectable()
export class DeleteTransactionService {
  constructor(
    @inject('TransactionRepository')
    private transactionRepository: TransactionRepositoryInterface,

    @inject('WalletRepository')
    private walletRepository: WalletRepositoryInterface,

    private cache: CacheTrait,
  ) {}

  async execute(id: string, userId: string): Promise<void> {
    const transaction = await this.transactionRepository.findById(id);

    if (!transaction) {
      throw new AppError('Transação não encontrada', 404);
    }

    const wallet = await this.walletRepository.findById(transaction.walletId);

    if (!wallet || wallet.userId !== userId) {
      throw new AppError('Acesso negado', 403);
    }

    // Se estava concluída, reverte o impacto no saldo
    if (transaction.status === TransactionStatusEnum.COMPLETED) {
      const amount = Number(transaction.amount);
      const revertedBalance = transaction.type === TransactionTypeEnum.INCOME 
        ? Number(wallet.balance) - amount 
        : Number(wallet.balance) + amount;
      
      await this.walletRepository.update(wallet.id, { balance: revertedBalance as any });
    }

    await this.transactionRepository.delete(id);

    // Invalida caches
    await this.cache.del(`wallet:detail:${wallet.id}`);
    await this.cache.del(`wallets:user:${userId}`);
    await this.cache.del(`transactions:user:${userId}`);
    await this.cache.del(`transactions:wallet:${wallet.id}`);
  }
}
