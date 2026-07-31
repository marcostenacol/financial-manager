import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DeleteSavingsGoalService } from '@/modules/savings-goals/services/DeleteSavingsGoalService';
import { SavingsGoalRepositoryInterface } from '@/modules/savings-goals/repositories/contracts/SavingsGoalRepositoryInterface';
import { CacheTrait } from '@/base/traits/CacheTrait';

describe('DeleteSavingsGoalService', () => {
  let savingsGoalRepository: SavingsGoalRepositoryInterface;
  let cacheTrait: CacheTrait;
  let deleteSavingsGoalService: DeleteSavingsGoalService;

  beforeEach(() => {
    savingsGoalRepository = {
      findById: vi.fn(),
      delete: vi.fn(),
    } as any;

    cacheTrait = {
      del: vi.fn(),
    } as any;

    deleteSavingsGoalService = new DeleteSavingsGoalService(savingsGoalRepository, cacheTrait);
  });

  it('should delete a savings goal owned by the user and clear cache', async () => {
    const userId = 'user-id';
    const goalId = 'goal-id';

    vi.spyOn(savingsGoalRepository, 'findById').mockResolvedValue({ id: goalId, userId } as any);

    await deleteSavingsGoalService.execute(goalId, userId);

    expect(savingsGoalRepository.delete).toHaveBeenCalledWith(goalId);
    expect(cacheTrait.del).toHaveBeenCalledWith(`savings-goals:user:${userId}`);
  });

  it('should throw when the savings goal does not exist', async () => {
    vi.spyOn(savingsGoalRepository, 'findById').mockResolvedValue(null);

    await expect(deleteSavingsGoalService.execute('goal-id', 'user-id')).rejects.toThrow('Meta não encontrada');
  });

  it('should throw when the savings goal belongs to another user', async () => {
    vi.spyOn(savingsGoalRepository, 'findById').mockResolvedValue({ id: 'goal-id', userId: 'other-user' } as any);

    await expect(deleteSavingsGoalService.execute('goal-id', 'user-id')).rejects.toThrow(
      'Você não tem permissão para deletar esta meta',
    );
  });
});
