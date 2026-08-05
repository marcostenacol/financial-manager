import { InviteRedemption, Prisma } from '@prisma/client';

export interface InviteRedemptionWithUser extends InviteRedemption {
  user: { id: string; email: string };
}

export interface InviteRedemptionRepositoryInterface {
  create(data: Prisma.InviteRedemptionUncheckedCreateInput, tx?: Prisma.TransactionClient): Promise<InviteRedemption>;
  findAllByInviteId(inviteId: string): Promise<InviteRedemptionWithUser[]>;
  deleteAllByInviteId(inviteId: string, tx?: Prisma.TransactionClient): Promise<void>;
  deleteAllByOrganizationId(organizationId: string, tx?: Prisma.TransactionClient): Promise<void>;
}
