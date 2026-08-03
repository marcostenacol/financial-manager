import { injectable } from 'tsyringe';
import { Wallet, Prisma, ProfileScope } from '@prisma/client';
import { prisma } from '@/shared/database/PrismaClient';
import { WalletRepositoryInterface } from './contracts/WalletRepositoryInterface';

@injectable()
export class WalletRepository implements WalletRepositoryInterface {
  async create(data: Prisma.WalletUncheckedCreateInput): Promise<Wallet> {
    return prisma.wallet.create({
      data,
    });
  }

  async findAllByUserId(user_id: string, scope?: ProfileScope): Promise<Wallet[]> {
    return prisma.wallet.findMany({
      where: { userId: user_id, ...(scope && { scope }) },
      orderBy: { name: 'asc' },
    });
  }

  async findById(id: string): Promise<Wallet | null> {
    return prisma.wallet.findUnique({
      where: { id },
    });
  }

  async update(id: string, data: Prisma.WalletUncheckedUpdateInput, tx?: Prisma.TransactionClient): Promise<Wallet> {
    return (tx ?? prisma).wallet.update({
      where: { id },
      data,
    });
  }

  async delete(id: string): Promise<void> {
    await prisma.wallet.delete({
      where: { id },
    });
  }

  async deleteAllByUserId(user_id: string, tx?: Prisma.TransactionClient): Promise<void> {
    await (tx ?? prisma).wallet.deleteMany({
      where: { userId: user_id },
    });
  }

  async setPrimary(id: string, user_id: string, scope: ProfileScope): Promise<Wallet> {
    const [, wallet] = await prisma.$transaction([
      prisma.wallet.updateMany({
        where: { userId: user_id, scope, isPrimary: true },
        data: { isPrimary: false },
      }),
      prisma.wallet.update({
        where: { id },
        data: { isPrimary: true },
      }),
    ]);

    return wallet;
  }
}
