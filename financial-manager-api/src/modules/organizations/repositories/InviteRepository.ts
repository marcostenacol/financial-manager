import { injectable } from 'tsyringe';
import { Invite, Prisma } from '@prisma/client';
import { prisma } from '@/shared/database/PrismaClient';
import { InviteRepositoryInterface } from './contracts/InviteRepositoryInterface';

@injectable()
export class InviteRepository implements InviteRepositoryInterface {
  async create(data: Prisma.InviteUncheckedCreateInput): Promise<Invite> {
    return prisma.invite.create({ data });
  }

  async findByCode(code: string): Promise<Invite | null> {
    return prisma.invite.findUnique({ where: { code } });
  }

  async findById(id: string): Promise<Invite | null> {
    return prisma.invite.findUnique({ where: { id } });
  }

  async findAllByOrganizationId(organizationId: string): Promise<Invite[]> {
    return prisma.invite.findMany({
      where: { organizationId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async update(id: string, data: Prisma.InviteUncheckedUpdateInput, tx?: Prisma.TransactionClient): Promise<Invite> {
    return (tx ?? prisma).invite.update({ where: { id }, data });
  }

  async delete(id: string, tx?: Prisma.TransactionClient): Promise<void> {
    await (tx ?? prisma).invite.delete({ where: { id } });
  }

  async deleteAllByOrganizationId(organizationId: string, tx?: Prisma.TransactionClient): Promise<void> {
    await (tx ?? prisma).invite.deleteMany({ where: { organizationId } });
  }
}
