import { inject, injectable } from 'tsyringe';
import { ReportRepositoryInterface, DashboardOverviewData, DashboardOverviewRange } from '../repositories/contracts/ReportRepositoryInterface';
import { CacheTrait } from '@/base/traits/CacheTrait';
import { CacheKeys } from '@/shared/cache/CacheKeys';

@injectable()
export class GetDashboardOverviewService {
  constructor(
    @inject('ReportRepository')
    private reportRepository: ReportRepositoryInterface,

    private cache: CacheTrait,
  ) {}

  async execute(userId: string, range?: DashboardOverviewRange, scope?: string): Promise<DashboardOverviewData> {
    const cacheKey = CacheKeys.reports.overview(userId, range, scope);

    const cached = await this.cache.get<DashboardOverviewData>(cacheKey);
    if (cached) {
      return cached;
    }

    const data = await this.reportRepository.getDashboardOverview(userId, range, scope);

    // Cache curto para dashboard (5 minutos)
    await this.cache.set(cacheKey, data, 300);

    return data;
  }
}
