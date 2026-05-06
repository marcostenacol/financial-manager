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

  async findByUserId(userId: string, filters?: any): Promise<Transaction[]> {
    return prisma.transaction.findMany({
      where: {
        wallet: {
          userId,
        },
        ...filters,
      },
      include: {
        category: true,
        wallet: true,
      },
      orderBy: {
        occurredAt: 'desc',
      },
    });
  }
}
