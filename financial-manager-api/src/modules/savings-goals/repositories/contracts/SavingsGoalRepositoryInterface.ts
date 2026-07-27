import { SavingsGoal } from '@prisma/client';
import { ICreateSavingsGoalDTO } from '../../dtos/ICreateSavingsGoalDTO';

export interface SavingsGoalRepositoryInterface {
  create(data: ICreateSavingsGoalDTO & { userId: string }): Promise<SavingsGoal>;
  findAllByUserId(userId: string): Promise<SavingsGoal[]>;
  findById(id: string): Promise<SavingsGoal | null>;
  update(id: string, data: Partial<ICreateSavingsGoalDTO>): Promise<SavingsGoal>;
  delete(id: string): Promise<void>;
}
