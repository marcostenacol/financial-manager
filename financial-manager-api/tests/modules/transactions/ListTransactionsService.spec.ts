import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ListTransactionsService } from '@/modules/transactions/services/ListTransactionsService';
import { TransactionRepositoryInterface } from '@/modules/transactions/repositories/contracts/TransactionRepositoryInterface';
import { CacheTrait } from '@/base/traits/CacheTrait';

describe('ListTransactionsService', () => {
  let transactionRepository: TransactionRepositoryInterface;
  let cacheTrait: CacheTrait;
  let listTransactionsService: ListTransactionsService;

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
    const cachedData = {
      transactions: [{ id: 'tx-1', description: 'Test' }] as any,
      total: 1
    };

    vi.spyOn(cacheTrait, 'get').mockResolvedValue(cachedData);

    const result = await listTransactionsService.execute(userId, {});

    expect(result).toEqual(cachedData);
    expect(transactionRepository.findByUserId).not.toHaveBeenCalled();
  });

  it('should return transactions from repository and set cache if not available', async () => {
    const userId = 'user-1';
    const dbData = {
      data: [{ id: 'tx-1', description: 'Test' }] as any,
      total: 1
    };

    vi.spyOn(cacheTrait, 'get').mockResolvedValue(null);
    vi.spyOn(transactionRepository, 'findByUserId').mockResolvedValue(dbData);

    const result = await listTransactionsService.execute(userId, {});

    expect(result).toEqual({ transactions: dbData.data, total: dbData.total });
    expect(cacheTrait.set).toHaveBeenCalled();
  });
});
