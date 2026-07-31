import { inject, injectable } from 'tsyringe';
import { Category } from '@prisma/client';
import { CategoryRepositoryInterface } from '../repositories/contracts/CategoryRepositoryInterface';
import { CacheTrait } from '@/base/traits/CacheTrait';
import { CacheKeys } from '@/shared/cache/CacheKeys';

@injectable()
export class ListCategoriesService {
  constructor(
    @inject('CategoryRepository')
    private categoryRepository: CategoryRepositoryInterface,

    private cache: CacheTrait,
  ) {}

  async execute(userId: string): Promise<Category[]> {
    const cacheKey = CacheKeys.categories.list(userId);
    
    const cachedCategories = await this.cache.get<Category[]>(cacheKey);
    if (cachedCategories) {
      return cachedCategories;
    }

    const categories = await this.categoryRepository.findAllByUserId(userId);

    await this.cache.set(cacheKey, categories);

    return categories;
  }
}
