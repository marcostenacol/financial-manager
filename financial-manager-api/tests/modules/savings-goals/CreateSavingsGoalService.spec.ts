import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CreateSavingsGoalService } from '@/modules/savings-goals/services/CreateSavingsGoalService';
import { SavingsGoalRepositoryInterface } from '@/modules/savings-goals/repositories/contracts/SavingsGoalRepositoryInterface';
import { CacheTrait } from '@/base/traits/CacheTrait';

describe('CreateSavingsGoalService', () => {
  let savingsGoalRepository: SavingsGoalRepositoryInterface;
  let cacheTrait: CacheTrait;
  let createSavingsGoalService: CreateSavingsGoalService;

  beforeEach(() => {
    savingsGoalRepository = {
      create: vi.fn(),
    } as any;

    cacheTrait = {
      del: vi.fn(),
    } as any;

    createSavingsGoalService = new CreateSavingsGoalService(savingsGoalRepository, cacheTrait);
  });

  it('should create a new savings goal and clear cache', async () => {
    const userId = 'user-id';
    const data = { name: 'Viagem', target_amount: 5000, current_amount: 0 } as any;

    vi.spyOn(savingsGoalRepository, 'create').mockResolvedValue({
      id: 'goal-id',
      userId,
      ...data,
    } as any);

    const result = await createSavingsGoalService.execute(data, userId);

    expect(result).toHaveProperty('id');
    expect(result.name).toBe(data.name);
    expect(cacheTrait.del).toHaveBeenCalledWith(`savings-goals:user:${userId}`);
  });
});
