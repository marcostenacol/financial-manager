import { inject, injectable } from 'tsyringe';
import { ReportRepositoryInterface, ExpenseByCategoryData, DashboardOverviewRange } from '../repositories/contracts/ReportRepositoryInterface';
import { CacheTrait } from '@/base/traits/CacheTrait';
import { CacheKeys } from '@/shared/cache/CacheKeys';

@injectable()
export class GetExpensesByCategoryService {
  constructor(
    @inject('ReportRepository')
    private reportRepository: ReportRepositoryInterface,

    private cache: CacheTrait,
  ) {}

  async execute(userId: string, month: number, year: number, organizationId?: string, range?: DashboardOverviewRange): Promise<ExpenseByCategoryData[]> {
    if (organizationId) {
      return this.reportRepository.getExpensesByCategory(userId, month, year, organizationId, range);
    }

    const cacheKey = CacheKeys.reports.expensesByCategory(userId, month, year, range);

    const cached = await this.cache.get<ExpenseByCategoryData[]>(cacheKey);
    if (cached) {
      return cached;
    }

    const data = await this.reportRepository.getExpensesByCategory(userId, month, year, undefined, range);

    await this.cache.set(cacheKey, data, 600); // 10 minutos

    return data;
  }
}
