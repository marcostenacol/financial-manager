import { inject, injectable } from 'tsyringe';
import { Transaction } from '@prisma/client';
import { TransactionRepositoryInterface } from '../repositories/contracts/TransactionRepositoryInterface';
import { CacheTrait } from '@/base/traits/CacheTrait';

interface Filters {
  wallet_id?: string;
  category_id?: string;
  start_date?: string;
  end_date?: string;
  type?: 'income' | 'expense' | 'transfer';
  status?: 'pending' | 'completed' | 'cancelled';
  search?: string;
  page?: number;
  per_page?: number;
}

@injectable()
export class ListTransactionsService {
  constructor(
    @inject('TransactionRepository')
    private transactionRepository: TransactionRepositoryInterface,

    private cache: CacheTrait,
  ) {}

  async execute(userId: string, filters: Filters): Promise<{ transactions: Transaction[], total: number }> {
    const cacheKey = `transactions:user:${userId}:${JSON.stringify(filters)}`;
    
    const cached = await this.cache.get<{ transactions: Transaction[], total: number }>(cacheKey);
    if (cached) {
      return cached;
    }

    const prismaFilters: any = {};

    if (filters.category_id) prismaFilters.categoryId = filters.category_id;
    if (filters.wallet_id) prismaFilters.walletId = filters.wallet_id;
    if (filters.type) prismaFilters.type = filters.type;
    if (filters.status) prismaFilters.status = filters.status;
    
    if (filters.search) {
      prismaFilters.description = {
        contains: filters.search,
        mode: 'insensitive',
      };
    }
    
    if (filters.start_date || filters.end_date) {
      prismaFilters.occurredAt = {};
      if (filters.start_date) prismaFilters.occurredAt.gte = new Date(filters.start_date);
      if (filters.end_date) prismaFilters.occurredAt.lte = new Date(filters.end_date);
    }

    const page = Number(filters.page) || 1;
    const perPage = Number(filters.per_page) || 10;

    const { data: transactions, total } = await this.transactionRepository.findByUserId(userId, {
      where: prismaFilters,
      take: perPage,
      skip: (page - 1) * perPage,
    });

    const result = { transactions, total };

    await this.cache.set(cacheKey, result);

    return result;
  }
}
