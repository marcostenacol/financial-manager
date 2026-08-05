import { inject, injectable } from 'tsyringe';
import { Prisma } from '@prisma/client';
import { TransactionRepositoryInterface } from '../repositories/contracts/TransactionRepositoryInterface';
import { CacheTrait } from '@/base/traits/CacheTrait';
import { CacheKeys } from '@/shared/cache/CacheKeys';
import { ListTransactionsFilterDTOType } from '../dtos/ListTransactionsFilterDTO';
import { AppError } from '@/shared/errors/AppError';

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

  async execute(userId: string, filters: ListTransactionsFilterDTOType, organizationIds: string[] = []): Promise<ListTransactionsResult> {
    const prismaFilters: Prisma.TransactionWhereInput = {};

    if (filters.category_id) prismaFilters.categoryId = filters.category_id;
    if (filters.wallet_id) prismaFilters.walletId = filters.wallet_id;
    if (filters.type) prismaFilters.type = filters.type;
    if (filters.status) prismaFilters.status = filters.status;
    if (filters.search) prismaFilters.description = { contains: filters.search, mode: 'insensitive' };

    if (filters.start_date || filters.end_date) {
      prismaFilters.occurredAt = {};
      if (filters.start_date) prismaFilters.occurredAt.gte = new Date(filters.start_date);
      if (filters.end_date) prismaFilters.occurredAt.lte = new Date(filters.end_date);
    }

    const pagination = {
      skip: (filters.page - 1) * filters.per_page,
      take: filters.per_page,
    };

    if (filters.organization_id) {
      if (!organizationIds.includes(filters.organization_id)) {
        throw new AppError('Você não faz parte desta organização', 403);
      }

      const { data, total } = await this.transactionRepository.findByOrganizationId(filters.organization_id, prismaFilters, pagination);
      return { transactions: data, total };
    }

    const cacheKey = CacheKeys.transactions.list(userId, filters);

    const cached = await this.cache.get<ListTransactionsResult>(cacheKey);
    if (cached) {
      return cached;
    }

    const { data, total } = await this.transactionRepository.findByUserId(userId, prismaFilters, pagination);

    const result: ListTransactionsResult = { transactions: data, total };

    await this.cache.set(cacheKey, result);

    return result;
  }
}
