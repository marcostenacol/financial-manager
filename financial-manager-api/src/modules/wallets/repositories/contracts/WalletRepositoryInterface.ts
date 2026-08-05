import { Wallet, Prisma, ProfileScope } from '@prisma/client';

export interface WalletRepositoryInterface {
  create(data: Prisma.WalletUncheckedCreateInput): Promise<Wallet>;
  findAllByUserId(user_id: string, scope?: ProfileScope): Promise<Wallet[]>;
  findAllByOwner(user_id: string, organization_ids: string[], scope?: ProfileScope): Promise<Wallet[]>;
  findById(id: string): Promise<Wallet | null>;
  update(id: string, data: Prisma.WalletUncheckedUpdateInput, tx?: Prisma.TransactionClient): Promise<Wallet>;
  delete(id: string): Promise<void>;
  deleteAllByUserId(user_id: string, tx?: Prisma.TransactionClient): Promise<void>;
  findAllByOrganizationId(organization_id: string): Promise<Wallet[]>;
  deleteAllByOrganizationId(organization_id: string, tx?: Prisma.TransactionClient): Promise<void>;
  setPrimary(id: string, user_id: string, scope: ProfileScope): Promise<Wallet>;
}
