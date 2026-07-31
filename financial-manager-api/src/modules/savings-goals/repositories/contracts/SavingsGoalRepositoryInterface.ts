import { SavingsGoal } from '@prisma/client';
import { CreateSavingsGoalDTOType } from '../../dtos/CreateSavingsGoalDTO';
import { UpdateSavingsGoalDTOType } from '../../dtos/UpdateSavingsGoalDTO';

export interface SavingsGoalRepositoryInterface {
  create(data: CreateSavingsGoalDTOType & { userId: string }): Promise<SavingsGoal>;
  findAllByUserId(userId: string): Promise<SavingsGoal[]>;
  findById(id: string): Promise<SavingsGoal | null>;
  update(id: string, data: UpdateSavingsGoalDTOType): Promise<SavingsGoal>;
  delete(id: string): Promise<void>;
}
