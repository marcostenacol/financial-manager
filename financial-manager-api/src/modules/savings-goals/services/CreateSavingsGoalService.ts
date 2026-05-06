import { inject, injectable } from 'tsyringe';
import { SavingsGoalRepositoryInterface } from '../repositories/contracts/SavingsGoalRepositoryInterface';
import { ICreateSavingsGoalDTO } from '../dtos/ICreateSavingsGoalDTO';
import { SavingsGoal } from '@prisma/client';
import { CacheTrait } from '@/base/traits/CacheTrait';

@injectable()
export class CreateSavingsGoalService {
  constructor(
    @inject('SavingsGoalRepository')
    private savingsGoalRepository: SavingsGoalRepositoryInterface,

    private cache: CacheTrait,
  ) {}

  async execute(data: ICreateSavingsGoalDTO, userId: string): Promise<SavingsGoal> {
    const goal = await this.savingsGoalRepository.create({
      ...data,
      userId,
    });

    await this.cache.del(`savings-goals:user:${userId}`);

    return goal;
  }
}
