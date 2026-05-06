import { injectable } from 'tsyringe';
import { Wallet } from '@prisma/client';
import { BaseRepository } from '@/base/repository/BaseRepository';
import { WalletRepositoryInterface } from './contracts/WalletRepositoryInterface';

@injectable()
export class WalletRepository extends BaseRepository implements WalletRepositoryInterface {
  async create(data: { user_id: string; name: string; balance?: number }): Promise<Wallet> {
    return this.prisma.wallet.create({
      data: {
        userId: data.user_id,
        name: data.name,
        balance: data.balance || 0,
      },
    });
  }

  async findAllByUserId(user_id: string): Promise<Wallet[]> {
    return this.prisma.wallet.findMany({
      where: { userId: user_id },
      orderBy: { name: 'asc' },
    });
  }

  async findById(id: string): Promise<Wallet | null> {
    return this.prisma.wallet.findUnique({
      where: { id },
    });
  }

  async update(id: string, data: Partial<Wallet>): Promise<Wallet> {
    return this.prisma.wallet.update({
      where: { id },
      data,
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.wallet.delete({
      where: { id },
    });
  }
}
