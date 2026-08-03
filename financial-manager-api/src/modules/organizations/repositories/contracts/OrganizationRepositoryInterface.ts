import { Organization, Prisma } from '@prisma/client';

export interface OrganizationRepositoryInterface {
  create(data: Prisma.OrganizationUncheckedCreateInput, tx?: Prisma.TransactionClient): Promise<Organization>;
  findById(id: string): Promise<Organization | null>;
}
