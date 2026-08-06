import { inject, injectable } from 'tsyringe';
import { ReportRepositoryInterface, CashFlowByCostCenterData, DashboardOverviewRange } from '../repositories/contracts/ReportRepositoryInterface';
import { CacheTrait } from '@/base/traits/CacheTrait';
import { CacheKeys } from '@/shared/cache/CacheKeys';

@injectable()
export class GetCashFlowByCostCenterService {
  constructor(
    @inject('ReportRepository')
    private reportRepository: ReportRepositoryInterface,

    private cache: CacheTrait,
  ) {}

  async execute(userId: string, month: number, year: number, organizationId?: string, range?: DashboardOverviewRange): Promise<CashFlowByCostCenterData[]> {
    if (organizationId) {
      return this.reportRepository.getCashFlowByCostCenter(userId, month, year, organizationId, range);
    }

    const cacheKey = CacheKeys.reports.cashFlowByCostCenter(userId, month, year, range);

    const cached = await this.cache.get<CashFlowByCostCenterData[]>(cacheKey);
    if (cached) {
      return cached;
    }

    const data = await this.reportRepository.getCashFlowByCostCenter(userId, month, year, undefined, range);

    await this.cache.set(cacheKey, data, 600); // 10 minutos

    return data;
  }
}
