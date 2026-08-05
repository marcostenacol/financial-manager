import { injectable } from 'tsyringe';
import { Organization, Prisma } from '@prisma/client';
import { prisma } from '@/shared/database/PrismaClient';
import { OrganizationRepositoryInterface } from './contracts/OrganizationRepositoryInterface';

@injectable()
export class OrganizationRepository implements OrganizationRepositoryInterface {
  async create(data: Prisma.OrganizationUncheckedCreateInput, tx?: Prisma.TransactionClient): Promise<Organization> {
    return (tx ?? prisma).organization.create({ data });
  }

  async findById(id: string): Promise<Organization | null> {
    return prisma.organization.findUnique({ where: { id } });
  }

  async delete(id: string, tx?: Prisma.TransactionClient): Promise<void> {
    await (tx ?? prisma).organization.delete({ where: { id } });
  }

  async countLinkedRecords(id: string): Promise<number> {
    const [wallets, categories, costCenters, savingsGoals] = await Promise.all([
      prisma.wallet.count({ where: { organizationId: id } }),
      prisma.category.count({ where: { organizationId: id } }),
      prisma.costCenter.count({ where: { organizationId: id } }),
      prisma.savingsGoal.count({ where: { organizationId: id } }),
    ]);

    return wallets + categories + costCenters + savingsGoals;
  }
}
