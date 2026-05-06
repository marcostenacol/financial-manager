import { inject, injectable } from 'tsyringe';
import { SavingsGoalRepositoryInterface } from '../repositories/contracts/SavingsGoalRepositoryInterface';
import { CacheTrait } from '@/base/traits/CacheTrait';

@injectable()
export class DeleteSavingsGoalService {
  constructor(
    @inject('SavingsGoalRepository')
    private savingsGoalRepository: SavingsGoalRepositoryInterface,

    private cache: CacheTrait,
  ) {}

  async execute(id: string, userId: string): Promise<void> {
    const goal = await this.savingsGoalRepository.findById(id);

    if (!goal) {
      throw new Error('Meta não encontrada');
    }

    if (goal.userId !== userId) {
      throw new Error('Você não tem permissão para deletar esta meta');
    }

    await this.savingsGoalRepository.delete(id);

    await this.cache.del(`savings-goals:user:${userId}`);
  }
}
