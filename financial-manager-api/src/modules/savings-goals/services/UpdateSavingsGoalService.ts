import { inject, injectable } from 'tsyringe';
import { SavingsGoalRepositoryInterface } from '../repositories/contracts/SavingsGoalRepositoryInterface';
import { UpdateSavingsGoalDTOType } from '../dtos/UpdateSavingsGoalDTO';
import { SavingsGoal } from '@prisma/client';
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
      throw new Error('Meta não encontrada');
    }

    if (goal.userId !== userId) {
      throw new Error('Você não tem permissão para editar esta meta');
    }

    const updatedGoal = await this.savingsGoalRepository.update(id, data);

    await this.cache.del(CacheKeys.savingsGoals.list(userId));

    return updatedGoal;
  }
}
