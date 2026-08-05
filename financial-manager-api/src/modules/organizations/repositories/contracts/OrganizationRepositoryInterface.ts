import { Organization, Prisma } from '@prisma/client';

export interface OrganizationRepositoryInterface {
  create(data: Prisma.OrganizationUncheckedCreateInput, tx?: Prisma.TransactionClient): Promise<Organization>;
  findById(id: string): Promise<Organization | null>;
  delete(id: string, tx?: Prisma.TransactionClient): Promise<void>;
  countLinkedRecords(id: string): Promise<number>;
}
