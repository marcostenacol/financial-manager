import { Invite, Prisma } from '@prisma/client';

export interface InviteRepositoryInterface {
  create(data: Prisma.InviteUncheckedCreateInput): Promise<Invite>;
  findByCode(code: string): Promise<Invite | null>;
  findById(id: string): Promise<Invite | null>;
  findAllByOrganizationId(organizationId: string): Promise<Invite[]>;
  update(id: string, data: Prisma.InviteUncheckedUpdateInput, tx?: Prisma.TransactionClient): Promise<Invite>;
}
