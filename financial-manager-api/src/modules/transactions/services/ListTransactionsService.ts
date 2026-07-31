import { inject, injectable } from 'tsyringe';
import { Transaction } from '@prisma/client';
import { TransactionRepositoryInterface } from '../repositories/contracts/TransactionRepositoryInterface';
import { CacheTrait } from '@/base/traits/CacheTrait';
import { CacheKeys } from '@/shared/cache/CacheKeys';
import { ListTransactionsFilterDTOType } from '../dtos/ListTransactionsFilterDTO';

@injectable()
export class ListTransactionsService {
  constructor(
    @inject('TransactionRepository')
    private transactionRepository: TransactionRepositoryInterface,

    private cache: CacheTrait,
  ) {}

  async execute(userId: string, filters: ListTransactionsFilterDTOType): Promise<Transaction[]> {
    const cacheKey = CacheKeys.transactions.list(userId, filters);
    
    const cachedTransactions = await this.cache.get<Transaction[]>(cacheKey);
    if (cachedTransactions) {
      return cachedTransactions;
    }

    const prismaFilters: any = {};

    if (filters.category_id) prismaFilters.categoryId = filters.category_id;
    if (filters.wallet_id) prismaFilters.walletId = filters.wallet_id;
    
    if (filters.start_date || filters.end_date) {
      prismaFilters.occurredAt = {};
      if (filters.start_date) prismaFilters.occurredAt.gte = new Date(filters.start_date);
      if (filters.end_date) prismaFilters.occurredAt.lte = new Date(filters.end_date);
    }

    const transactions = await this.transactionRepository.findByUserId(userId, prismaFilters);

    await this.cache.set(cacheKey, transactions);

    return transactions;
  }
}
