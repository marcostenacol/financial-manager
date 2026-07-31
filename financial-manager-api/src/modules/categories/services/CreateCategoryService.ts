import { inject, injectable } from 'tsyringe';
import { Category } from '@prisma/client';
import { CategoryRepositoryInterface } from '../repositories/contracts/CategoryRepositoryInterface';
import { CreateCategoryDTOType } from '../dtos/CreateCategoryDTO';
import { AppError } from '@/shared/errors/AppError';
import { CacheTrait } from '@/base/traits/CacheTrait';
import { CacheKeys } from '@/shared/cache/CacheKeys';

@injectable()
export class CreateCategoryService {
  constructor(
    @inject('CategoryRepository')
    private categoryRepository: CategoryRepositoryInterface,

    private cache: CacheTrait,
  ) {}

  async execute(data: CreateCategoryDTOType, userId: string): Promise<Category> {
    const categoryExists = await this.categoryRepository.findByName(data.name, userId);

    if (categoryExists) {
      throw new AppError('Você já possui uma categoria com este nome');
    }

    const category = await this.categoryRepository.create({
      ...data,
      userId,
    });

    await this.cache.del(CacheKeys.categories.list(userId));

    return category;
  }
}
