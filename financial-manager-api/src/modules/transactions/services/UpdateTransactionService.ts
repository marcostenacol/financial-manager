import { inject, injectable } from 'tsyringe';
import { Transaction, Prisma } from '@prisma/client';
import { TransactionRepositoryInterface } from '../repositories/contracts/TransactionRepositoryInterface';
import { WalletRepositoryInterface } from '@/modules/wallets/repositories/contracts/WalletRepositoryInterface';
import { UpdateTransactionDTOType } from '../dtos/UpdateTransactionDTO';
import { AppError } from '@/shared/errors/AppError';
import { TransactionStatusEnum } from '../enums/TransactionStatusEnum';
import { TransactionTypeEnum } from '../enums/TransactionTypeEnum';
import { CacheTrait } from '@/base/traits/CacheTrait';
import { CacheKeys } from '@/shared/cache/CacheKeys';

@injectable()
export class UpdateTransactionService {
  constructor(
    @inject('TransactionRepository')
    private transactionRepository: TransactionRepositoryInterface,

    @inject('WalletRepository')
    private walletRepository: WalletRepositoryInterface,

    private cache: CacheTrait,
  ) {}

  async execute(id: string, data: UpdateTransactionDTOType, userId: string): Promise<Transaction> {
    const transaction = await this.transactionRepository.findById(id);

    if (!transaction) {
      throw new AppError('Transação não encontrada', 404);
    }

    const wallet = await this.walletRepository.findById(transaction.walletId);

    if (!wallet || wallet.userId !== userId) {
      throw new AppError('Acesso negado', 403);
    }

    // Se o status anterior era concluído, reverte o impacto no saldo
    if (transaction.status === TransactionStatusEnum.COMPLETED) {
      const amount = Number(transaction.amount);
      const revertedBalance = transaction.type === TransactionTypeEnum.INCOME 
        ? Number(wallet.balance) - amount 
        : Number(wallet.balance) + amount;
      
      await this.walletRepository.update(wallet.id, { balance: new Prisma.Decimal(revertedBalance) });
    }

    // Atualiza a transação
    const updatedTransaction = await this.transactionRepository.update(id, {
      description: data.description,
      amount: data.amount,
      type: data.type,
      status: data.status,
      categoryId: data.category_id,
      occurredAt: data.occurred_at ? new Date(data.occurred_at) : undefined,
    });

    // Se o novo status for concluído, aplica o novo impacto
    if (updatedTransaction.status === TransactionStatusEnum.COMPLETED) {
      const currentWallet = await this.walletRepository.findById(wallet.id);
      const amount = Number(updatedTransaction.amount);
      
      const newBalance = updatedTransaction.type === TransactionTypeEnum.INCOME 
        ? Number(currentWallet!.balance) + amount 
        : Number(currentWallet!.balance) - amount;

      await this.walletRepository.update(wallet.id, { balance: new Prisma.Decimal(newBalance) });
    }

    // Invalida caches (incluindo listagens filtradas)
    await this.cache.del(CacheKeys.wallets.detail(wallet.id));
    await this.cache.del(CacheKeys.wallets.list(userId));
    await this.cache.del(CacheKeys.transactions.detail(id));
    await this.cache.delPattern(CacheKeys.transactions.listPattern(userId));
    await this.cache.delPattern(CacheKeys.transactions.byWalletPattern(wallet.id));
    await this.cache.del(CacheKeys.reports.overview(userId));

    return updatedTransaction;
  }
}
