import { inject, injectable } from 'tsyringe';
import { SavingsGoalRepositoryInterface } from '../repositories/contracts/SavingsGoalRepositoryInterface';
import { ICreateSavingsGoalDTO } from '../dtos/ICreateSavingsGoalDTO';
import { SavingsGoal } from '@prisma/client';
import { CacheTrait } from '@/base/traits/CacheTrait';

@injectable()
export class UpdateSavingsGoalService {
  constructor(
    @inject('SavingsGoalRepository')
    private savingsGoalRepository: SavingsGoalRepositoryInterface,

    private cache: CacheTrait,
  ) {}

  async execute(id: string, data: Partial<ICreateSavingsGoalDTO>, userId: string): Promise<SavingsGoal> {
    const goal = await this.savingsGoalRepository.findById(id);

    if (!goal) {
      throw new Error('Meta não encontrada');
    }

    if (goal.userId !== userId) {
      throw new Error('Você não tem permissão para editar esta meta');
    }

    const updatedGoal = await this.savingsGoalRepository.update(id, data);

    await this.cache.del(`savings-goals:user:${userId}`);

    return updatedGoal;
  }
}
