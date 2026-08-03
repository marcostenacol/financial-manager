import { inject, injectable } from 'tsyringe';
import { Category, ProfileScope } from '@prisma/client';
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

  async execute(userId: string, scope?: ProfileScope, organizationIds: string[] = []): Promise<Category[]> {
    if (organizationIds.length > 0) {
      return this.categoryRepository.findAllByOwner(userId, organizationIds, scope);
    }

    const cacheKey = CacheKeys.categories.list(userId, scope);

    const cachedCategories = await this.cache.get<Category[]>(cacheKey);
    if (cachedCategories) {
      return cachedCategories;
    }

    const categories = await this.categoryRepository.findAllByUserId(userId, scope);

    await this.cache.set(cacheKey, categories);

    return categories;
  }
}
