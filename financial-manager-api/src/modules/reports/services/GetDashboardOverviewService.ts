import { inject, injectable } from 'tsyringe';
import { ReportRepositoryInterface, DashboardOverviewData } from '../repositories/contracts/ReportRepositoryInterface';
import { CacheTrait } from '@/base/traits/CacheTrait';

@injectable()
export class GetDashboardOverviewService {
  constructor(
    @inject('ReportRepository')
    private reportRepository: ReportRepositoryInterface,

    private cache: CacheTrait,
  ) {}

  async execute(userId: string): Promise<DashboardOverviewData> {
    const cacheKey = `reports:overview:${userId}`;
    
    const cached = await this.cache.get<DashboardOverviewData>(cacheKey);
    if (cached) {
      return cached;
    }

    const data = await this.reportRepository.getDashboardOverview(userId);

    // Cache curto para dashboard (5 minutos)
    await this.cache.set(cacheKey, data, 300);

    return data;
  }
}
