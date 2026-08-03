import { injectable } from 'tsyringe';
import { CostCenter, Prisma } from '@prisma/client';
import { prisma } from '@/shared/database/PrismaClient';
import { CostCenterRepositoryInterface } from './contracts/CostCenterRepositoryInterface';

@injectable()
export class CostCenterRepository implements CostCenterRepositoryInterface {
  async create(data: Prisma.CostCenterUncheckedCreateInput): Promise<CostCenter> {
    return prisma.costCenter.create({ data });
  }

  async update(id: string, data: Prisma.CostCenterUncheckedUpdateInput): Promise<CostCenter> {
    return prisma.costCenter.update({ where: { id }, data });
  }

  async delete(id: string): Promise<void> {
    await prisma.costCenter.delete({ where: { id } });
  }

  async findById(id: string): Promise<CostCenter | null> {
    return prisma.costCenter.findUnique({ where: { id } });
  }

  async findAllByUserId(userId: string): Promise<CostCenter[]> {
    return prisma.costCenter.findMany({
      where: { userId },
      orderBy: { name: 'asc' },
    });
  }

  async findAllByOwner(userId: string, organizationIds: string[]): Promise<CostCenter[]> {
    return prisma.costCenter.findMany({
      where: { OR: [{ userId }, { organizationId: { in: organizationIds } }] },
      orderBy: { name: 'asc' },
    });
  }
}
