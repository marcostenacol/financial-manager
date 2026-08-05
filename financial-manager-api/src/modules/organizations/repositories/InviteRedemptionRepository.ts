import { injectable } from 'tsyringe';
import { InviteRedemption, Prisma } from '@prisma/client';
import { prisma } from '@/shared/database/PrismaClient';
import {
  InviteRedemptionRepositoryInterface,
  InviteRedemptionWithUser,
} from './contracts/InviteRedemptionRepositoryInterface';

@injectable()
export class InviteRedemptionRepository implements InviteRedemptionRepositoryInterface {
  async create(data: Prisma.InviteRedemptionUncheckedCreateInput, tx?: Prisma.TransactionClient): Promise<InviteRedemption> {
    return (tx ?? prisma).inviteRedemption.create({ data });
  }

  async deleteAllByInviteId(inviteId: string, tx?: Prisma.TransactionClient): Promise<void> {
    await (tx ?? prisma).inviteRedemption.deleteMany({ where: { inviteId } });
  }

  async deleteAllByOrganizationId(organizationId: string, tx?: Prisma.TransactionClient): Promise<void> {
    await (tx ?? prisma).inviteRedemption.deleteMany({ where: { invite: { organizationId } } });
  }

  async findAllByInviteId(inviteId: string): Promise<InviteRedemptionWithUser[]> {
    return prisma.inviteRedemption.findMany({
      where: { inviteId },
      include: { user: { select: { id: true, email: true } } },
      orderBy: { usedAt: 'desc' },
    });
  }
}
