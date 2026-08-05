import { Recurrence, Prisma } from '@prisma/client';
import { RecurrenceRepositoryInterface, RecurrenceWithRelations } from './contracts/RecurrenceRepositoryInterface';
import { prisma } from '@/shared/database/PrismaClient';
import { injectable } from 'tsyringe';

@injectable()
export class RecurrenceRepository implements RecurrenceRepositoryInterface {
  async create(data: Prisma.RecurrenceUncheckedCreateInput): Promise<Recurrence> {
    return prisma.recurrence.create({
      data,
    });
  }

  async update(id: string, data: Prisma.RecurrenceUncheckedUpdateInput, tx?: Prisma.TransactionClient): Promise<Recurrence> {
    return (tx ?? prisma).recurrence.update({
      where: { id },
      data,
    });
  }

  async delete(id: string): Promise<void> {
    await prisma.recurrence.delete({
      where: { id },
    });
  }

  async findById(id: string): Promise<RecurrenceWithRelations | null> {
    return prisma.recurrence.findUnique({
      where: { id },
      include: {
        wallet: true,
        category: true,
      },
    });
  }

  async findByUserId(userId: string): Promise<Recurrence[]> {
    return this.findByOwner(userId, []);
  }

  async findByOwner(userId: string, organizationIds: string[]): Promise<Recurrence[]> {
    return prisma.recurrence.findMany({
      where: {
        wallet: {
          OR: [{ userId }, { organizationId: { in: organizationIds } }],
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

  async findAllActive(): Promise<Recurrence[]> {
    return prisma.recurrence.findMany({
      where: {
        isActive: true,
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

  async findActiveByUserId(userId: string): Promise<Recurrence[]> {
    return prisma.recurrence.findMany({
      where: {
        wallet: {
          userId,
        },
        isActive: true,
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

  async deleteAllByUserId(userId: string, tx?: Prisma.TransactionClient): Promise<void> {
    await (tx ?? prisma).recurrence.deleteMany({
      where: { wallet: { userId } },
    });
  }

  async deleteAllByOrganizationId(organizationId: string, tx?: Prisma.TransactionClient): Promise<void> {
    await (tx ?? prisma).recurrence.deleteMany({
      where: { wallet: { organizationId } },
    });
  }
}
