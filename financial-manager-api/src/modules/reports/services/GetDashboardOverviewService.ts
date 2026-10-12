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

  async execute(userId: string, range?: DashboardOverviewRange, scope?: string, organizationId?: string, walletIds?: string[]): Promise<DashboardOverviewData> {
    // Resultado filtrado por carteira não é cacheado: a invalidação das escritas só conhece as chaves sem filtro
    if (organizationId || walletIds?.length) {
      return this.reportRepository.getDashboardOverview(userId, range, scope, organizationId, walletIds);
    }

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
