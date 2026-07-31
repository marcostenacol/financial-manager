import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ListSavingsGoalsService } from '@/modules/savings-goals/services/ListSavingsGoalsService';
import { SavingsGoalRepositoryInterface } from '@/modules/savings-goals/repositories/contracts/SavingsGoalRepositoryInterface';
import { CacheTrait } from '@/base/traits/CacheTrait';

describe('ListSavingsGoalsService', () => {
  let savingsGoalRepository: SavingsGoalRepositoryInterface;
  let cacheTrait: CacheTrait;
  let listSavingsGoalsService: ListSavingsGoalsService;

  beforeEach(() => {
    savingsGoalRepository = {
      findAllByUserId: vi.fn(),
    } as any;

    cacheTrait = {
      get: vi.fn(),
      set: vi.fn(),
    } as any;

    listSavingsGoalsService = new ListSavingsGoalsService(savingsGoalRepository, cacheTrait);
  });

  it('should list savings goals from cache if available', async () => {
    const userId = 'user-id';
    const cachedGoals = [{ id: 'goal-id', name: 'Viagem' }];

    vi.spyOn(cacheTrait, 'get').mockResolvedValue(cachedGoals as any);

    const result = await listSavingsGoalsService.execute(userId);

    expect(result).toEqual(cachedGoals);
    expect(savingsGoalRepository.findAllByUserId).not.toHaveBeenCalled();
  });

  it('should list savings goals from repository and set cache if not in cache', async () => {
    const userId = 'user-id';
    const goals = [{ id: 'goal-id', name: 'Viagem' }];

    vi.spyOn(cacheTrait, 'get').mockResolvedValue(null);
    vi.spyOn(savingsGoalRepository, 'findAllByUserId').mockResolvedValue(goals as any);

    const result = await listSavingsGoalsService.execute(userId);

    expect(result).toEqual(goals);
    expect(cacheTrait.set).toHaveBeenCalledWith(`savings-goals:user:${userId}`, goals, 60 * 30);
  });
});
