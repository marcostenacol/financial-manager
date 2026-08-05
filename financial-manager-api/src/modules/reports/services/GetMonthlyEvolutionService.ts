import { inject, injectable } from 'tsyringe';
import { ReportRepositoryInterface, MonthlyEvolutionData } from '../repositories/contracts/ReportRepositoryInterface';
import { CacheTrait } from '@/base/traits/CacheTrait';
import { CacheKeys } from '@/shared/cache/CacheKeys';

@injectable()
export class GetMonthlyEvolutionService {
  constructor(
    @inject('ReportRepository')
    private reportRepository: ReportRepositoryInterface,

    private cache: CacheTrait,
  ) {}

  async execute(userId: string, organizationId?: string): Promise<MonthlyEvolutionData[]> {
    if (organizationId) {
      return this.reportRepository.getMonthlyEvolution(userId, organizationId);
    }

    const cacheKey = CacheKeys.reports.monthlyEvolution(userId);

    const cached = await this.cache.get<MonthlyEvolutionData[]>(cacheKey);
    if (cached) {
      return cached;
    }

    const data = await this.reportRepository.getMonthlyEvolution(userId);

    await this.cache.set(cacheKey, data, 1800); // 30 minutos

    return data;
  }
}
