import { inject, injectable } from 'tsyringe';
import { Prisma, Transaction } from '@prisma/client';
import { prisma } from '@/shared/database/PrismaClient';
import { TransactionRepositoryInterface } from '../repositories/contracts/TransactionRepositoryInterface';
import { WalletRepositoryInterface } from '@/modules/wallets/repositories/contracts/WalletRepositoryInterface';
import { CreateTransactionDTOType } from '../dtos/CreateTransactionDTO';
import { AppError } from '@/shared/errors/AppError';
import { TransactionStatusEnum } from '../enums/TransactionStatusEnum';
import { TransactionTypeEnum } from '../enums/TransactionTypeEnum';
import { CacheTrait } from '@/base/traits/CacheTrait';
import { CacheKeys } from '@/shared/cache/CacheKeys';

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

    const amount = new Prisma.Decimal(data.amount);
    const isCompleted = data.status === TransactionStatusEnum.COMPLETED;
    const balanceDelta = data.type === TransactionTypeEnum.INCOME ? amount : amount.negated();

    const transaction = await prisma.$transaction(async (tx) => {
      const createdTransaction = await this.transactionRepository.create({
        walletId: data.wallet_id,
        categoryId: data.category_id,
        type: data.type,
        amount,
        description: data.description,
        status: data.status,
        occurredAt: new Date(data.occurred_at),
      }, tx);

      if (isCompleted) {
        await this.walletRepository.update(wallet.id, {
          balance: { increment: balanceDelta },
        }, tx);
      }

      return createdTransaction;
    });

    if (isCompleted) {
      // Invalida cache da carteira e lista de carteiras
      await this.cache.del(CacheKeys.wallets.detail(wallet.id));
      await this.cache.del(CacheKeys.wallets.list(userId));
    }

    // Invalida cache de transações
    await this.cache.del(CacheKeys.transactions.byWallet(wallet.id));
    await this.cache.delPattern(CacheKeys.transactions.listPattern(userId));
    await this.cache.delPattern(CacheKeys.reports.overviewPattern(userId));
    await this.cache.del(CacheKeys.reports.monthlyEvolution(userId));
    await this.cache.delPattern(CacheKeys.reports.expensesByCategoryPattern(userId));

    return transaction;
  }
}
