import { inject, injectable } from 'tsyringe';
import { CategoryRepositoryInterface } from '../repositories/contracts/CategoryRepositoryInterface';
import { UpdateCategoryDTOType } from '../dtos/UpdateCategoryDTO';
import { Category } from '@prisma/client';
import { CacheTrait } from '@/base/traits/CacheTrait';
import { CacheKeys } from '@/shared/cache/CacheKeys';

@injectable()
export class UpdateCategoryService {
  constructor(
    @inject('CategoryRepository')
    private categoryRepository: CategoryRepositoryInterface,

    private cache: CacheTrait,
  ) {}

  async execute(id: string, data: UpdateCategoryDTOType, userId: string): Promise<Category> {
    const category = await this.categoryRepository.findById(id);

    if (!category) {
      throw new Error('Categoria não encontrada');
    }

    if (category.userId && category.userId !== userId) {
      throw new Error('Você não tem permissão para editar esta categoria');
    }

    if (!category.userId) {
      throw new Error('Categorias de sistema não podem ser editadas');
    }

    const updatedCategory = await this.categoryRepository.update(id, data);

    await this.cache.delPattern(CacheKeys.categories.listPattern(userId));

    return updatedCategory;
  }
}
