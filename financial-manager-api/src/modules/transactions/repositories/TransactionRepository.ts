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
    return this.findByOwner(userId, [], filters, pagination);
  }

  async findByOwner(
    userId: string,
    organizationIds: string[],
    filters: Prisma.TransactionWhereInput,
    pagination: { skip: number; take: number },
  ): Promise<PaginatedTransactions> {
    const where: Prisma.TransactionWhereInput = {
      wallet: {
        OR: [{ userId }, { organizationId: { in: organizationIds } }],
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

  async findByOrganizationId(
    organizationId: string,
    filters: Prisma.TransactionWhereInput,
    pagination: { skip: number; take: number },
  ): Promise<PaginatedTransactions> {
    const where: Prisma.TransactionWhereInput = {
      wallet: { organizationId },
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

  async deleteAllByUserId(userId: string, tx?: Prisma.TransactionClient): Promise<void> {
    await (tx ?? prisma).transaction.deleteMany({
      where: { wallet: { userId } },
    });
  }

  async nullifyRecurrenceForUser(userId: string, tx?: Prisma.TransactionClient): Promise<void> {
    await (tx ?? prisma).transaction.updateMany({
      where: { wallet: { userId }, recurrenceId: { not: null } },
      data: { recurrenceId: null },
    });
  }

  async deleteAllByOrganizationId(organizationId: string, tx?: Prisma.TransactionClient): Promise<void> {
    await (tx ?? prisma).transaction.deleteMany({
      where: { wallet: { organizationId } },
    });
  }

  async nullifyRecurrenceForOrganization(organizationId: string, tx?: Prisma.TransactionClient): Promise<void> {
    await (tx ?? prisma).transaction.updateMany({
      where: { wallet: { organizationId }, recurrenceId: { not: null } },
      data: { recurrenceId: null },
    });
  }
}
