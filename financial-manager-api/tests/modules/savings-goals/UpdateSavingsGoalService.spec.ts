import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UpdateSavingsGoalService } from '@/modules/savings-goals/services/UpdateSavingsGoalService';
import { SavingsGoalRepositoryInterface } from '@/modules/savings-goals/repositories/contracts/SavingsGoalRepositoryInterface';
import { CacheTrait } from '@/base/traits/CacheTrait';

describe('UpdateSavingsGoalService', () => {
  let savingsGoalRepository: SavingsGoalRepositoryInterface;
  let cacheTrait: CacheTrait;
  let updateSavingsGoalService: UpdateSavingsGoalService;

  beforeEach(() => {
    savingsGoalRepository = {
      findById: vi.fn(),
      update: vi.fn(),
    } as any;

    cacheTrait = {
      del: vi.fn(),
    } as any;

    updateSavingsGoalService = new UpdateSavingsGoalService(savingsGoalRepository, cacheTrait);
  });

  it('should update a savings goal owned by the user and clear cache', async () => {
    const userId = 'user-id';
    const goalId = 'goal-id';

    vi.spyOn(savingsGoalRepository, 'findById').mockResolvedValue({ id: goalId, userId } as any);
    vi.spyOn(savingsGoalRepository, 'update').mockResolvedValue({ id: goalId, userId, name: 'Novo nome' } as any);

    const result = await updateSavingsGoalService.execute(goalId, { name: 'Novo nome' } as any, userId);

    expect(result.name).toBe('Novo nome');
    expect(cacheTrait.del).toHaveBeenCalledWith(`savings-goals:user:${userId}`);
  });

  it('should throw when the savings goal does not exist', async () => {
    vi.spyOn(savingsGoalRepository, 'findById').mockResolvedValue(null);

    await expect(
      updateSavingsGoalService.execute('goal-id', {} as any, 'user-id'),
    ).rejects.toThrow('Meta não encontrada');
  });

  it('should throw when the savings goal belongs to another user', async () => {
    vi.spyOn(savingsGoalRepository, 'findById').mockResolvedValue({ id: 'goal-id', userId: 'other-user' } as any);

    await expect(
      updateSavingsGoalService.execute('goal-id', {} as any, 'user-id'),
    ).rejects.toThrow('Você não tem permissão para editar esta meta');
  });
});
