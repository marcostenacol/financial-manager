import { inject, injectable } from 'tsyringe';
import { Prisma } from '@prisma/client';
import { TransactionRepositoryInterface } from '../repositories/contracts/TransactionRepositoryInterface';
import { CacheTrait } from '@/base/traits/CacheTrait';
import { CacheKeys } from '@/shared/cache/CacheKeys';
import { ListTransactionsFilterDTOType } from '../dtos/ListTransactionsFilterDTO';

export interface ListTransactionsResult {
  transactions: Awaited<ReturnType<TransactionRepositoryInterface['findByUserId']>>['data'];
  total: number;
}

@injectable()
export class ListTransactionsService {
  constructor(
    @inject('TransactionRepository')
    private transactionRepository: TransactionRepositoryInterface,

    private cache: CacheTrait,
  ) {}

  async execute(userId: string, filters: ListTransactionsFilterDTOType): Promise<ListTransactionsResult> {
    const cacheKey = CacheKeys.transactions.list(userId, filters);

    const cached = await this.cache.get<ListTransactionsResult>(cacheKey);
    if (cached) {
      return cached;
    }

    const prismaFilters: Prisma.TransactionWhereInput = {};

    if (filters.category_id) prismaFilters.categoryId = filters.category_id;
    if (filters.wallet_id) prismaFilters.walletId = filters.wallet_id;
    if (filters.type) prismaFilters.type = filters.type;
    if (filters.search) prismaFilters.description = { contains: filters.search, mode: 'insensitive' };

    if (filters.start_date || filters.end_date) {
      prismaFilters.occurredAt = {};
      if (filters.start_date) prismaFilters.occurredAt.gte = new Date(filters.start_date);
      if (filters.end_date) prismaFilters.occurredAt.lte = new Date(filters.end_date);
    }

    const { data, total } = await this.transactionRepository.findByUserId(userId, prismaFilters, {
      skip: (filters.page - 1) * filters.per_page,
      take: filters.per_page,
    });

    const result: ListTransactionsResult = { transactions: data, total };

    await this.cache.set(cacheKey, result);

    return result;
  }
}
