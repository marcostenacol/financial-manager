import { Wallet } from '@prisma/client';

export interface WalletRepositoryInterface {
  create(data: { user_id: string; name: string; balance?: number }): Promise<Wallet>;
  findAllByUserId(user_id: string): Promise<Wallet[]>;
  findById(id: string): Promise<Wallet | null>;
  update(id: string, data: Partial<Wallet>): Promise<Wallet>;
  delete(id: string): Promise<void>;
}
