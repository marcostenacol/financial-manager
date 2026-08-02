import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ClearAllSavingsGoalsService } from '@/modules/savings-goals/services/ClearAllSavingsGoalsService';
import { SavingsGoalRepositoryInterface } from '@/modules/savings-goals/repositories/contracts/SavingsGoalRepositoryInterface';
import { CacheTrait } from '@/base/traits/CacheTrait';

describe('ClearAllSavingsGoalsService', () => {
  let savingsGoalRepository: SavingsGoalRepositoryInterface;
  let cacheTrait: CacheTrait;
  let clearAllSavingsGoalsService: ClearAllSavingsGoalsService;

  beforeEach(() => {
    savingsGoalRepository = {
      deleteAllByUserId: vi.fn(),
    } as any;

    cacheTrait = {
      del: vi.fn(),
    } as any;

    clearAllSavingsGoalsService = new ClearAllSavingsGoalsService(savingsGoalRepository, cacheTrait);
  });

  it('should delete all savings goals for the user and clear the cache', async () => {
    await clearAllSavingsGoalsService.execute('user-1');

    expect(savingsGoalRepository.deleteAllByUserId).toHaveBeenCalledWith('user-1');
    expect(cacheTrait.del).toHaveBeenCalledWith('savings-goals:user:user-1');
  });
});
