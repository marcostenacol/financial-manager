import { injectable } from 'tsyringe';
import { Wallet, Prisma } from '@prisma/client';
import { prisma } from '@/shared/database/PrismaClient';
import { WalletRepositoryInterface } from './contracts/WalletRepositoryInterface';

@injectable()
export class WalletRepository implements WalletRepositoryInterface {
  async create(data: Prisma.WalletUncheckedCreateInput): Promise<Wallet> {
    return prisma.wallet.create({
      data,
    });
  }

  async findAllByUserId(user_id: string): Promise<Wallet[]> {
    return prisma.wallet.findMany({
      where: { userId: user_id },
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

  async setPrimary(id: string, user_id: string): Promise<Wallet> {
    const [, wallet] = await prisma.$transaction([
      prisma.wallet.updateMany({
        where: { userId: user_id, isPrimary: true },
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
