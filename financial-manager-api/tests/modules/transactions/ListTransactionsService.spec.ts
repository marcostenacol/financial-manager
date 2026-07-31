import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ListTransactionsService } from '@/modules/transactions/services/ListTransactionsService';
import { TransactionRepositoryInterface } from '@/modules/transactions/repositories/contracts/TransactionRepositoryInterface';
import { CacheTrait } from '@/base/traits/CacheTrait';

describe('ListTransactionsService', () => {
  let transactionRepository: TransactionRepositoryInterface;
  let cacheTrait: CacheTrait;
  let listTransactionsService: ListTransactionsService;

  const baseFilters = { page: 1, per_page: 10 } as any;

  beforeEach(() => {
    transactionRepository = {
      findByUserId: vi.fn(),
    } as any;

    cacheTrait = {
      get: vi.fn(),
      set: vi.fn(),
    } as any;

    listTransactionsService = new ListTransactionsService(transactionRepository, cacheTrait);
  });

  it('should return transactions from cache if available', async () => {
    const userId = 'user-1';
    const cached = { transactions: [{ id: 'tx-1', description: 'Test' }], total: 1 };

    vi.spyOn(cacheTrait, 'get').mockResolvedValue(cached as any);

    const result = await listTransactionsService.execute(userId, baseFilters);

    expect(result).toEqual(cached);
    expect(transactionRepository.findByUserId).not.toHaveBeenCalled();
  });

  it('should return transactions from repository, paginate and set cache if not available', async () => {
    const userId = 'user-1';
    const dbData = { data: [{ id: 'tx-1', description: 'Test' }], total: 1 };

    vi.spyOn(cacheTrait, 'get').mockResolvedValue(null);
    vi.spyOn(transactionRepository, 'findByUserId').mockResolvedValue(dbData as any);

    const result = await listTransactionsService.execute(userId, { ...baseFilters, page: 2, per_page: 5 });

    expect(result).toEqual({ transactions: dbData.data, total: dbData.total });
    expect(transactionRepository.findByUserId).toHaveBeenCalledWith(
      userId,
      expect.any(Object),
      { skip: 5, take: 5 },
    );
    expect(cacheTrait.set).toHaveBeenCalled();
  });

  it('should build type and search filters and pass them to the repository', async () => {
    const userId = 'user-1';

    vi.spyOn(cacheTrait, 'get').mockResolvedValue(null);
    vi.spyOn(transactionRepository, 'findByUserId').mockResolvedValue({ data: [], total: 0 } as any);

    await listTransactionsService.execute(userId, { ...baseFilters, type: 'income', search: 'salário' } as any);

    expect(transactionRepository.findByUserId).toHaveBeenCalledWith(
      userId,
      expect.objectContaining({
        type: 'income',
        description: { contains: 'salário', mode: 'insensitive' },
      }),
      { skip: 0, take: 10 },
    );
  });
});
