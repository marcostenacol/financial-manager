import { Transaction, Prisma } from '@prisma/client';
import { TransactionRepositoryInterface, PaginatedTransactions } from './contracts/TransactionRepositoryInterface';
import { prisma } from '@/shared/database/PrismaClient';
import { injectable } from 'tsyringe';

@injectable()
export class TransactionRepository implements TransactionRepositoryInterface {
  async create(data: Prisma.TransactionUncheckedCreateInput, tx?: Prisma.TransactionClient): Promise<Transaction> {
    return (tx ?? prisma).transaction.create({
      data,
    });
  }

  async update(id: string, data: Prisma.TransactionUncheckedUpdateInput, tx?: Prisma.TransactionClient): Promise<Transaction> {
    return (tx ?? prisma).transaction.update({
      where: { id },
      data,
    });
  }

  async delete(id: string, tx?: Prisma.TransactionClient): Promise<void> {
    await (tx ?? prisma).transaction.delete({
      where: { id },
    });
  }

  async findById(id: string): Promise<Transaction | null> {
    return prisma.transaction.findUnique({
      where: { id },
      include: {
        category: true,
        wallet: true,
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

  async findByUserId(
    userId: string,
    filters: Prisma.TransactionWhereInput,
    pagination: { skip: number; take: number },
  ): Promise<PaginatedTransactions> {
    const where: Prisma.TransactionWhereInput = {
      wallet: {
        userId,
      },
      ...filters,
    };

    const [data, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        include: {
          category: true,
          wallet: true,
        },
        orderBy: {
          occurredAt: 'desc',
        },
        skip: pagination.skip,
        take: pagination.take,
      }),
      prisma.transaction.count({ where }),
    ]);

    return { data, total };
  }
}
