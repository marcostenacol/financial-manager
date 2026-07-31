import { inject, injectable } from 'tsyringe';
import { SavingsGoalRepositoryInterface } from '../repositories/contracts/SavingsGoalRepositoryInterface';
import { SavingsGoal } from '@prisma/client';
import { CacheTrait } from '@/base/traits/CacheTrait';
import { CacheKeys } from '@/shared/cache/CacheKeys';

@injectable()
export class ListSavingsGoalsService {
  constructor(
    @inject('SavingsGoalRepository')
    private savingsGoalRepository: SavingsGoalRepositoryInterface,

    private cache: CacheTrait,
  ) {}

  async execute(userId: string): Promise<SavingsGoal[]> {
    const cacheKey = CacheKeys.savingsGoals.list(userId);
    const cached = await this.cache.get<SavingsGoal[]>(cacheKey);

    if (cached) {
      return cached;
    }

    const goals = await this.savingsGoalRepository.findAllByUserId(userId);

    await this.cache.set(cacheKey, goals, 60 * 30); // 30 min

    return goals;
  }
}
