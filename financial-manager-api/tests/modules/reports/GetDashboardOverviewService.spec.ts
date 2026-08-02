import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GetDashboardOverviewService } from '@/modules/reports/services/GetDashboardOverviewService';
import { ReportRepositoryInterface } from '@/modules/reports/repositories/contracts/ReportRepositoryInterface';
import { CacheTrait } from '@/base/traits/CacheTrait';

describe('GetDashboardOverviewService', () => {
  let reportRepository: ReportRepositoryInterface;
  let cacheTrait: CacheTrait;
  let getDashboardOverviewService: GetDashboardOverviewService;

  beforeEach(() => {
    reportRepository = {
      getDashboardOverview: vi.fn(),
    } as any;

    cacheTrait = {
      get: vi.fn(),
      set: vi.fn(),
    } as any;

    getDashboardOverviewService = new GetDashboardOverviewService(reportRepository, cacheTrait);
  });

  it('should return dashboard overview from cache if available', async () => {
    const userId = 'user-1';
    const cachedData = {
      total_balance: 1000,
      monthly_income: 500,
      monthly_expense: 200,
      last_month_income: 400,
      last_month_expense: 150,
    };

    vi.spyOn(cacheTrait, 'get').mockResolvedValue(cachedData);

    const result = await getDashboardOverviewService.execute(userId);

    expect(result).toEqual(cachedData);
    expect(reportRepository.getDashboardOverview).not.toHaveBeenCalled();
  });

  it('should return dashboard overview from repository and set cache if not available', async () => {
    const userId = 'user-1';
    const dbData = {
      total_balance: 1000,
      monthly_income: 500,
      monthly_expense: 200,
      last_month_income: 400,
      last_month_expense: 150,
    };

    vi.spyOn(cacheTrait, 'get').mockResolvedValue(null);
    vi.spyOn(reportRepository, 'getDashboardOverview').mockResolvedValue(dbData);

    const result = await getDashboardOverviewService.execute(userId);

    expect(result).toEqual(dbData);
    expect(cacheTrait.set).toHaveBeenCalledWith(`reports:overview:${userId}::`, dbData, 300);
  });

  it('should forward the date range to the repository and use a range-specific cache key', async () => {
    const userId = 'user-1';
    const range = { start_date: '2026-01-01', end_date: '2026-01-31' };
    const dbData = {
      total_balance: 1000,
      monthly_income: 500,
      monthly_expense: 200,
      last_month_income: 400,
      last_month_expense: 150,
    };

    vi.spyOn(cacheTrait, 'get').mockResolvedValue(null);
    vi.spyOn(reportRepository, 'getDashboardOverview').mockResolvedValue(dbData);

    await getDashboardOverviewService.execute(userId, range);

    expect(reportRepository.getDashboardOverview).toHaveBeenCalledWith(userId, range);
    expect(cacheTrait.set).toHaveBeenCalledWith(
      `reports:overview:${userId}:${range.start_date}:${range.end_date}`,
      dbData,
      300,
    );
  });
});
