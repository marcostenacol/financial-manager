import { inject, injectable } from 'tsyringe';
import { ReportRepositoryInterface, MonthlyEvolutionData, DashboardOverviewRange } from '../repositories/contracts/ReportRepositoryInterface';
import { CacheTrait } from '@/base/traits/CacheTrait';
import { CacheKeys } from '@/shared/cache/CacheKeys';

@injectable()
export class GetMonthlyEvolutionService {
  constructor(
    @inject('ReportRepository')
    private reportRepository: ReportRepositoryInterface,

    private cache: CacheTrait,
  ) {}

  async execute(userId: string, organizationId?: string, range?: DashboardOverviewRange, walletIds?: string[]): Promise<MonthlyEvolutionData[]> {
    // Resultado filtrado por carteira não é cacheado: a invalidação das escritas só conhece as chaves sem filtro
    if (organizationId || walletIds?.length) {
      return this.reportRepository.getMonthlyEvolution(userId, organizationId, range, walletIds);
    }

    const cacheKey = CacheKeys.reports.monthlyEvolution(userId, range);

    const cached = await this.cache.get<MonthlyEvolutionData[]>(cacheKey);
    if (cached) {
      return cached;
    }

    const data = await this.reportRepository.getMonthlyEvolution(userId, undefined, range);

    await this.cache.set(cacheKey, data, 1800); // 30 minutos

    return data;
  }
}
