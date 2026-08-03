import { inject, injectable } from 'tsyringe';
import { CategoryRepositoryInterface } from '../repositories/contracts/CategoryRepositoryInterface';
import { UpdateCategoryDTOType } from '../dtos/UpdateCategoryDTO';
import { Category } from '@prisma/client';
import { AppError } from '@/shared/errors/AppError';
import { CacheTrait } from '@/base/traits/CacheTrait';
import { CacheKeys } from '@/shared/cache/CacheKeys';

@injectable()
export class UpdateCategoryService {
  constructor(
    @inject('CategoryRepository')
    private categoryRepository: CategoryRepositoryInterface,

    private cache: CacheTrait,
  ) {}

  async execute(id: string, data: UpdateCategoryDTOType, userId: string, organizationIds: string[] = []): Promise<Category> {
    const category = await this.categoryRepository.findById(id);

    if (!category) {
      throw new AppError('Categoria não encontrada', 404);
    }

    if (!category.userId && !category.organizationId) {
      throw new AppError('Categorias de sistema não podem ser editadas', 403);
    }

    const ownedByUser = category.organizationId === null && category.userId === userId;
    const ownedByOrganization = category.organizationId !== null && organizationIds.includes(category.organizationId);

    if (!ownedByUser && !ownedByOrganization) {
      throw new AppError('Você não tem permissão para editar esta categoria', 403);
    }

    const updatedCategory = await this.categoryRepository.update(id, data);

    if (category.organizationId) {
      await this.cache.delPattern(CacheKeys.categories.listAllPattern());
    } else {
      await this.cache.delPattern(CacheKeys.categories.listPattern(userId));
    }

    return updatedCategory;
  }
}
