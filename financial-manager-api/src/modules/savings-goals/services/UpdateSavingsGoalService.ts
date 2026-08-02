import { inject, injectable } from 'tsyringe';
import { SavingsGoalRepositoryInterface } from '../repositories/contracts/SavingsGoalRepositoryInterface';
import { UpdateSavingsGoalDTOType } from '../dtos/UpdateSavingsGoalDTO';
import { SavingsGoal } from '@prisma/client';
import { AppError } from '@/shared/errors/AppError';
import { CacheTrait } from '@/base/traits/CacheTrait';
import { CacheKeys } from '@/shared/cache/CacheKeys';

@injectable()
export class UpdateSavingsGoalService {
  constructor(
    @inject('SavingsGoalRepository')
    private savingsGoalRepository: SavingsGoalRepositoryInterface,

    private cache: CacheTrait,
  ) {}

  async execute(id: string, data: UpdateSavingsGoalDTOType, userId: string): Promise<SavingsGoal> {
    const goal = await this.savingsGoalRepository.findById(id);

    if (!goal) {
      throw new AppError('Meta não encontrada', 404);
    }

    if (goal.userId !== userId) {
      throw new AppError('Você não tem permissão para editar esta meta', 403);
    }

    const effectiveTarget = data.target_amount ?? Number(goal.targetAmount);
    const effectiveCurrent = data.current_amount ?? Number(goal.currentAmount);

    if (effectiveCurrent > effectiveTarget) {
      throw new AppError('O valor já poupado não pode ser maior que o valor alvo', 422);
    }

    const updatedGoal = await this.savingsGoalRepository.update(id, data);

    await this.cache.del(CacheKeys.savingsGoals.list(userId));

    return updatedGoal;
  }
}
