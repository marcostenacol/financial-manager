import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GetDashboardOverviewService } from '@/modules/reports/services/GetDashboardOverviewService';
import { GetExpensesByCategoryService } from '@/modules/reports/services/GetExpensesByCategoryService';
import { GetMonthlyEvolutionService } from '@/modules/reports/services/GetMonthlyEvolutionService';
import { GetCashFlowByCostCenterService } from '@/modules/reports/services/GetCashFlowByCostCenterService';

describe('report services with wallet filter', () => {
  const walletIds = ['wallet-1', 'wallet-2'];
  let reportRepository: any;
  let cache: any;

  beforeEach(() => {
    reportRepository = {
      getDashboardOverview: vi.fn().mockResolvedValue({ total_balance: 1 }),
      getExpensesByCategory: vi.fn().mockResolvedValue([]),
      getMonthlyEvolution: vi.fn().mockResolvedValue([]),
      getCashFlowByCostCenter: vi.fn().mockResolvedValue([]),
    };
    cache = { get: vi.fn(), set: vi.fn() };
  });

  it('overview passes the wallet ids to the repository and skips the cache', async () => {
    const service = new GetDashboardOverviewService(reportRepository, cache);

    await service.execute('user-1', undefined, 'personal', undefined, walletIds);

    expect(reportRepository.getDashboardOverview).toHaveBeenCalledWith('user-1', undefined, 'personal', undefined, walletIds);
    expect(cache.get).not.toHaveBeenCalled();
    expect(cache.set).not.toHaveBeenCalled();
  });

  it('expenses by category passes the wallet ids and skips the cache', async () => {
    const service = new GetExpensesByCategoryService(reportRepository, cache);

    await service.execute('user-1', 10, 2026, undefined, undefined, walletIds);

    expect(reportRepository.getExpensesByCategory).toHaveBeenCalledWith('user-1', 10, 2026, undefined, undefined, walletIds);
    expect(cache.get).not.toHaveBeenCalled();
    expect(cache.set).not.toHaveBeenCalled();
  });

  it('evolution passes the wallet ids and skips the cache', async () => {
    const service = new GetMonthlyEvolutionService(reportRepository, cache);

    await service.execute('user-1', undefined, undefined, walletIds);

    expect(reportRepository.getMonthlyEvolution).toHaveBeenCalledWith('user-1', undefined, undefined, walletIds);
    expect(cache.get).not.toHaveBeenCalled();
    expect(cache.set).not.toHaveBeenCalled();
  });

  it('cost center flow passes the wallet ids and skips the cache', async () => {
    const service = new GetCashFlowByCostCenterService(reportRepository, cache);

    await service.execute('user-1', 10, 2026, undefined, undefined, walletIds);

    expect(reportRepository.getCashFlowByCostCenter).toHaveBeenCalledWith('user-1', 10, 2026, undefined, undefined, walletIds);
    expect(cache.get).not.toHaveBeenCalled();
    expect(cache.set).not.toHaveBeenCalled();
  });

  it('keeps using the cache when no wallet filter is given', async () => {
    cache.get.mockResolvedValue(null);
    const service = new GetMonthlyEvolutionService(reportRepository, cache);

    await service.execute('user-1');

    expect(cache.get).toHaveBeenCalled();
    expect(cache.set).toHaveBeenCalled();
  });
});
