import { inject, injectable } from 'tsyringe';
import { Transaction } from '@prisma/client';
import { TransactionRepositoryInterface } from '../repositories/contracts/TransactionRepositoryInterface';
import { WalletRepositoryInterface } from '@/modules/wallets/repositories/contracts/WalletRepositoryInterface';
import { CreateTransactionDTOType } from '../dtos/CreateTransactionDTO';
import { AppError } from '@/shared/errors/AppError';
import { TransactionStatusEnum } from '../enums/TransactionStatusEnum';
import { TransactionTypeEnum } from '../enums/TransactionTypeEnum';
import { CacheTrait } from '@/base/traits/CacheTrait';

@injectable()
export class CreateTransactionService {
  constructor(
    @inject('TransactionRepository')
    private transactionRepository: TransactionRepositoryInterface,

    @inject('WalletRepository')
    private walletRepository: WalletRepositoryInterface,

    private cache: CacheTrait,
  ) {}

  async execute(data: CreateTransactionDTOType, userId: string): Promise<Transaction> {
    const wallet = await this.walletRepository.findById(data.wallet_id);

    if (!wallet || wallet.userId !== userId) {
      throw new AppError('Carteira não encontrada', 404);
    }

    const transaction = await this.transactionRepository.create({
      description: data.description,
      amount: data.amount,
      type: data.type,
      status: data.status,
      walletId: data.wallet_id,
      categoryId: data.category_id,
      occurredAt: new Date(data.occurred_at || new Date()),
    });

    // Se a transação estiver concluída, atualiza o saldo da carteira
    if (data.status === TransactionStatusEnum.COMPLETED) {
      const amount = Number(data.amount);
      const newBalance = data.type === TransactionTypeEnum.INCOME 
        ? Number(wallet.balance) + amount 
        : Number(wallet.balance) - amount;

      await this.walletRepository.update(wallet.id, {
        balance: newBalance as any,
      });

      // Invalida cache da carteira e lista de carteiras
      await this.cache.del(`wallet:detail:${wallet.id}`);
      await this.cache.del(`wallets:user:${userId}`);
    }

    // Invalida cache de transações (incluindo listagens filtradas)
    await this.cache.delPattern(`transactions:wallet:${wallet.id}*`);
    await this.cache.delPattern(`transactions:user:${userId}*`);

    return transaction;
  }
}
