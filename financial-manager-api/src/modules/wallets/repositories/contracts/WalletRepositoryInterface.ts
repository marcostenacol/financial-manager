import { Wallet, Prisma } from '@prisma/client';

export interface WalletRepositoryInterface {
  create(data: Prisma.WalletUncheckedCreateInput): Promise<Wallet>;
  findAllByUserId(user_id: string): Promise<Wallet[]>;
  findById(id: string): Promise<Wallet | null>;
  update(id: string, data: Prisma.WalletUncheckedUpdateInput, tx?: Prisma.TransactionClient): Promise<Wallet>;
  delete(id: string): Promise<void>;
  setPrimary(id: string, user_id: string): Promise<Wallet>;
}
