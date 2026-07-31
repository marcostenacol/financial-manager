import { inject, injectable } from 'tsyringe';
import { SavingsGoalRepositoryInterface } from '../repositories/contracts/SavingsGoalRepositoryInterface';
import { CreateSavingsGoalDTOType } from '../dtos/CreateSavingsGoalDTO';
import { SavingsGoal } from '@prisma/client';
import { CacheTrait } from '@/base/traits/CacheTrait';
import { CacheKeys } from '@/shared/cache/CacheKeys';

@injectable()
export class CreateSavingsGoalService {
  constructor(
    @inject('SavingsGoalRepository')
    private savingsGoalRepository: SavingsGoalRepositoryInterface,

    private cache: CacheTrait,
  ) {}

  async execute(data: CreateSavingsGoalDTOType, userId: string): Promise<SavingsGoal> {
    const goal = await this.savingsGoalRepository.create({
      ...data,
      userId,
    });

    await this.cache.del(CacheKeys.savingsGoals.list(userId));

    return goal;
  }
}
