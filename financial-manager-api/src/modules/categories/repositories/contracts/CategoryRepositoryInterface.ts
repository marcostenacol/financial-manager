import { Category, Prisma, ProfileScope } from '@prisma/client';

export interface CategoryRepositoryInterface {
  create(data: Prisma.CategoryUncheckedCreateInput): Promise<Category>;
  update(id: string, data: Prisma.CategoryUncheckedUpdateInput): Promise<Category>;
  delete(id: string): Promise<void>;
  findById(id: string): Promise<Category | null>;
  findAllByUserId(userId: string, scope?: ProfileScope): Promise<Category[]>;
  findAllByOwner(userId: string, organizationIds: string[], scope?: ProfileScope): Promise<Category[]>;
  findByName(name: string, userId: string | null): Promise<Category | null>;
}
