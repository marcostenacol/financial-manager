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

  async execute(user_id: string, start_date?: Date, end_date?: Date): Promise<DashboardOverviewData> {
    const cacheKey = `reports:overview:${user_id}:${start_date?.toISOString()}:${end_date?.toISOString()}`;
    
    const cached = await this.cache.get<DashboardOverviewData>(cacheKey);
    if (cached) {
      return cached;
    }

    const data = await this.reportRepository.getDashboardOverview(user_id, start_date, end_date);

    // Cache curto para dashboard (5 minutos)
    await this.cache.set(cacheKey, data, 300);

    return data;
  }
}
