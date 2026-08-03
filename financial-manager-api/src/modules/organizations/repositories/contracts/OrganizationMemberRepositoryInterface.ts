import { OrganizationMember, Prisma } from '@prisma/client';

export interface OrganizationMemberWithUser extends OrganizationMember {
  user: { id: string; email: string };
}

export interface OrganizationMemberRepositoryInterface {
  create(data: Prisma.OrganizationMemberUncheckedCreateInput, tx?: Prisma.TransactionClient): Promise<OrganizationMember>;
  delete(id: string): Promise<void>;
  findByOrganizationAndUser(organizationId: string, userId: string): Promise<OrganizationMember | null>;
  findAllByUserId(userId: string): Promise<OrganizationMember[]>;
  findAllByOrganizationId(organizationId: string): Promise<OrganizationMemberWithUser[]>;
  countOwners(organizationId: string): Promise<number>;
  findOrganizationIdsByUserId(userId: string): Promise<string[]>;
}
