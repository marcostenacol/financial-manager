import { inject, injectable } from 'tsyringe';
import { SavingsGoalRepositoryInterface } from '../repositories/contracts/SavingsGoalRepositoryInterface';
import { CacheTrait } from '@/base/traits/CacheTrait';
import { CacheKeys } from '@/shared/cache/CacheKeys';

@injectable()
export class ClearAllSavingsGoalsService {
  constructor(
    @inject('SavingsGoalRepository')
    private savingsGoalRepository: SavingsGoalRepositoryInterface,

    private cache: CacheTrait,
  ) {}

  async execute(userId: string): Promise<void> {
    await this.savingsGoalRepository.deleteAllByUserId(userId);

    await this.cache.del(CacheKeys.savingsGoals.list(userId));
  }
}
