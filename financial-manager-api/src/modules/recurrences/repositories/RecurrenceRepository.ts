import { Recurrence, Prisma } from '@prisma/client';
import { RecurrenceRepositoryInterface } from './contracts/RecurrenceRepositoryInterface';
import { prisma } from '@/shared/database/PrismaClient';
import { injectable } from 'tsyringe';

@injectable()
export class RecurrenceRepository implements RecurrenceRepositoryInterface {
  async create(data: Prisma.RecurrenceUncheckedCreateInput): Promise<Recurrence> {
    return prisma.recurrence.create({
      data,
    });
  }

  async update(id: string, data: Prisma.RecurrenceUncheckedUpdateInput): Promise<Recurrence> {
    return prisma.recurrence.update({
      where: { id },
      data,
    });
  }

  async delete(id: string): Promise<void> {
    await prisma.recurrence.delete({
      where: { id },
    });
  }

  async findById(id: string): Promise<Recurrence | null> {
    return prisma.recurrence.findUnique({
      where: { id },
      include: {
        wallet: true,
        category: true,
      },
    });
  }

  async findByUserId(userId: string): Promise<Recurrence[]> {
    return prisma.recurrence.findMany({
      where: {
        wallet: {
          userId,
        },
      },
      include: {
        wallet: true,
        category: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findActiveByUserId(userId: string): Promise<Recurrence[]> {
    return prisma.recurrence.findMany({
      where: {
        wallet: {
          userId,
        },
        OR: [
          { endsAt: null },
          { endsAt: { gt: new Date() } },
        ],
      },
      include: {
        wallet: true,
        category: true,
      },
    });
  }
}
