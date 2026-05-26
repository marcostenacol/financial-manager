import { Transaction, Prisma } from '@prisma/client';
import { TransactionRepositoryInterface } from './contracts/TransactionRepositoryInterface';
import { prisma } from '@/shared/database/PrismaClient';
import { injectable } from 'tsyringe';

@injectable()
export class TransactionRepository implements TransactionRepositoryInterface {
  async create(data: Prisma.TransactionUncheckedCreateInput): Promise<Transaction> {
    return prisma.transaction.create({
      data,
    });
  }

  async update(id: string, data: Prisma.TransactionUncheckedUpdateInput): Promise<Transaction> {
    return prisma.transaction.update({
      where: { id },
      data,
    });
  }

  async delete(id: string): Promise<void> {
    await prisma.transaction.delete({
      where: { id },
    });
  }

  async findById(id: string): Promise<Transaction | null> {
    return prisma.transaction.findUnique({
      where: { id },
      include: {
        category: true,
        wallet: true,
        recurrence: true,
      },
    });
  }

  async findAllByWalletId(walletId: string, filters?: any): Promise<Transaction[]> {
    return prisma.transaction.findMany({
      where: {
        walletId,
        ...filters,
      },
      include: {
        category: true,
      },
      orderBy: {
        occurredAt: 'desc',
      },
    });
  }

  async findByUserId(userId: string, options?: { where?: any, take?: number, skip?: number }): Promise<{ data: Transaction[], total: number }> {
    const where = {
      wallet: {
        userId,
      },
      ...(options?.where || {}),
    };

    const [data, total] = await prisma.$transaction([
      prisma.transaction.findMany({
        where,
        include: {
          category: true,
          wallet: true,
          recurrence: true,
        },
        orderBy: {
          occurredAt: 'desc',
        },
        take: options?.take,
        skip: options?.skip,
      }),
      prisma.transaction.count({ where }),
    ]);

    return { data, total };
  }
}
