import { prisma } from '@/shared/database/PrismaClient';
import { SavingsGoal } from '@prisma/client';
import { SavingsGoalRepositoryInterface } from './contracts/SavingsGoalRepositoryInterface';
import { CreateSavingsGoalDTOType } from '../dtos/CreateSavingsGoalDTO';
import { UpdateSavingsGoalDTOType } from '../dtos/UpdateSavingsGoalDTO';

export class SavingsGoalRepository implements SavingsGoalRepositoryInterface {
  async create(data: CreateSavingsGoalDTOType & { userId: string }): Promise<SavingsGoal> {
    return prisma.savingsGoal.create({
      data: {
        name: data.name,
        targetAmount: data.target_amount,
        currentAmount: data.current_amount,
        deadline: data.deadline ? new Date(data.deadline) : null,
        color: data.color,
        icon: data.icon,
        userId: data.userId,
      },
    });
  }

  async findAllByUserId(userId: string): Promise<SavingsGoal[]> {
    return prisma.savingsGoal.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string): Promise<SavingsGoal | null> {
    return prisma.savingsGoal.findUnique({
      where: { id },
    });
  }

  async update(id: string, data: UpdateSavingsGoalDTOType): Promise<SavingsGoal> {
    return prisma.savingsGoal.update({
      where: { id },
      data: {
        name: data.name,
        targetAmount: data.target_amount,
        currentAmount: data.current_amount,
        deadline: data.deadline ? new Date(data.deadline) : undefined,
        color: data.color,
        icon: data.icon,
      },
    });
  }

  async delete(id: string): Promise<void> {
    await prisma.savingsGoal.delete({
      where: { id },
    });
  }

  async deleteAllByUserId(userId: string): Promise<void> {
    await prisma.savingsGoal.deleteMany({
      where: { userId },
    });
  }
}
