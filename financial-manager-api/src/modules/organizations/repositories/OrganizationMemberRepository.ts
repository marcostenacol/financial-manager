import { injectable } from 'tsyringe';
import { OrganizationMember, Prisma, OrganizationMemberRole } from '@prisma/client';
import { prisma } from '@/shared/database/PrismaClient';
import {
  OrganizationMemberRepositoryInterface,
  OrganizationMemberWithUser,
} from './contracts/OrganizationMemberRepositoryInterface';

@injectable()
export class OrganizationMemberRepository implements OrganizationMemberRepositoryInterface {
  async create(data: Prisma.OrganizationMemberUncheckedCreateInput, tx?: Prisma.TransactionClient): Promise<OrganizationMember> {
    return (tx ?? prisma).organizationMember.create({ data });
  }

  async update(id: string, data: Prisma.OrganizationMemberUncheckedUpdateInput, tx?: Prisma.TransactionClient): Promise<OrganizationMember> {
    return (tx ?? prisma).organizationMember.update({ where: { id }, data });
  }

  async delete(id: string): Promise<void> {
    await prisma.organizationMember.delete({ where: { id } });
  }

  async deleteAllByOrganizationId(organizationId: string, tx?: Prisma.TransactionClient): Promise<void> {
    await (tx ?? prisma).organizationMember.deleteMany({ where: { organizationId } });
  }

  async findByOrganizationAndUser(organizationId: string, userId: string): Promise<OrganizationMember | null> {
    return prisma.organizationMember.findUnique({
      where: { organizationId_userId: { organizationId, userId } },
    });
  }

  async findAllByUserId(userId: string): Promise<OrganizationMember[]> {
    return prisma.organizationMember.findMany({ where: { userId } });
  }

  async findAllByOrganizationId(organizationId: string): Promise<OrganizationMemberWithUser[]> {
    return prisma.organizationMember.findMany({
      where: { organizationId },
      include: { user: { select: { id: true, email: true } } },
      orderBy: { createdAt: 'asc' },
    });
  }

  async countOwners(organizationId: string): Promise<number> {
    return prisma.organizationMember.count({
      where: { organizationId, role: OrganizationMemberRole.owner },
    });
  }

  async findOrganizationIdsByUserId(userId: string): Promise<string[]> {
    const memberships = await prisma.organizationMember.findMany({
      where: { userId },
      select: { organizationId: true },
    });

    return memberships.map((membership) => membership.organizationId);
  }
}
