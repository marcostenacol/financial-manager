import { Category, Prisma } from '@prisma/client';
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

  async findAllByUserId(userId: string): Promise<Category[]> {
    return prisma.category.findMany({
      where: {
        OR: [
          { userId },
          { userId: null }, // Categorias globais do sistema
        ],
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
