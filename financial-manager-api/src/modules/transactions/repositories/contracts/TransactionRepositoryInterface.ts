import { Transaction, Prisma } from '@prisma/client';

export interface TransactionRepositoryInterface {
  create(data: Prisma.TransactionUncheckedCreateInput): Promise<Transaction>;
  update(id: string, data: Prisma.TransactionUncheckedUpdateInput): Promise<Transaction>;
  delete(id: string): Promise<void>;
  findById(id: string): Promise<Transaction | null>;
  findAllByWalletId(walletId: string, filters?: any): Promise<Transaction[]>;
  findByUserId(userId: string, filters?: any): Promise<Transaction[]>;
}
