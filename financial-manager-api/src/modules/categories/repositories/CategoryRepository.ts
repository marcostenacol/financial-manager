import { Category, Prisma, ProfileScope } from '@prisma/client';
import { CategoryRepositoryInterface } from './contracts/CategoryRepositoryInterface';
import { prisma } from '@/shared/database/PrismaClient';
import { injectable } from 'tsyringe';

@injectable()
export class CategoryRepository implements CategoryRepositoryInterface {
  async create(data: Prisma.CategoryUncheckedCreateInput): Promise<Category> {
    return prisma.category.create({
      data,
    });
  }

  async update(id: string, data: Prisma.CategoryUncheckedUpdateInput): Promise<Category> {
    return prisma.category.update({
      where: { id },
      data,
    });
  }

  async delete(id: string): Promise<void> {
    await prisma.category.delete({
      where: { id },
    });
  }

  async findById(id: string): Promise<Category | null> {
    return prisma.category.findUnique({
      where: { id },
    });
  }

  async findAllByUserId(userId: string, scope?: ProfileScope): Promise<Category[]> {
    return this.findAllByOwner(userId, [], scope);
  }

  async findAllByOwner(userId: string, organizationIds: string[], scope?: ProfileScope): Promise<Category[]> {
    const ownershipFilter: Prisma.CategoryWhereInput = {
      OR: [
        { userId, organizationId: null },
        { userId: null, organizationId: null }, // Categorias globais do sistema
        ...(organizationIds.length > 0 ? [{ organizationId: { in: organizationIds } }] : []),
      ],
    };

    const scopeFilter: Prisma.CategoryWhereInput | undefined = scope
      ? { OR: [{ scope }, { scope: null }] }
      : undefined;

    return prisma.category.findMany({
      where: {
        AND: [ownershipFilter, ...(scopeFilter ? [scopeFilter] : [])],
      },
      orderBy: {
        name: 'asc',
      },
    });
  }

  async findByName(name: string, userId: string | null): Promise<Category | null> {
    return prisma.category.findFirst({
      where: {
        name,
        userId,
      },
    });
  }
}
