import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GetCashFlowByCostCenterService } from '@/modules/reports/services/GetCashFlowByCostCenterService';
import { ReportRepositoryInterface } from '@/modules/reports/repositories/contracts/ReportRepositoryInterface';
import { CacheTrait } from '@/base/traits/CacheTrait';

describe('GetCashFlowByCostCenterService', () => {
  let reportRepository: ReportRepositoryInterface;
  let cacheTrait: CacheTrait;
  let service: GetCashFlowByCostCenterService;

  beforeEach(() => {
    reportRepository = {
      getCashFlowByCostCenter: vi.fn(),
    } as any;

    cacheTrait = {
      get: vi.fn(),
      set: vi.fn(),
    } as any;

    service = new GetCashFlowByCostCenterService(reportRepository, cacheTrait);
  });

  it('should return cached data when available', async () => {
    const cached = [{ cost_center_name: 'Marketing', color: '#3b82f6', total: 500, percentage: 100 }];
    vi.spyOn(cacheTrait, 'get').mockResolvedValue(cached);

    const result = await service.execute('user-1', 1, 2026);

    expect(result).toEqual(cached);
    expect(reportRepository.getCashFlowByCostCenter).not.toHaveBeenCalled();
  });

  it('should fetch from repository and cache when not cached', async () => {
    const data = [{ cost_center_name: 'Marketing', color: '#3b82f6', total: 500, percentage: 100 }];
    vi.spyOn(cacheTrait, 'get').mockResolvedValue(null);
    vi.spyOn(reportRepository, 'getCashFlowByCostCenter').mockResolvedValue(data);

    const result = await service.execute('user-1', 1, 2026);

    expect(result).toEqual(data);
    expect(cacheTrait.set).toHaveBeenCalledWith('reports:cash-flow-cost-center:user-1:1:2026::', data, 600);
  });
});
