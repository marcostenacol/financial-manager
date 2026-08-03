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
}
