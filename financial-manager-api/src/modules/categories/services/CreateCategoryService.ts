import { inject, injectable } from 'tsyringe';
import { Category } from '@prisma/client';
import { CategoryRepositoryInterface } from '../repositories/contracts/CategoryRepositoryInterface';
import { OrganizationMemberRepositoryInterface } from '@/modules/organizations/repositories/contracts/OrganizationMemberRepositoryInterface';
import { CreateCategoryDTOType } from '../dtos/CreateCategoryDTO';
import { AppError } from '@/shared/errors/AppError';
import { CacheTrait } from '@/base/traits/CacheTrait';
import { CacheKeys } from '@/shared/cache/CacheKeys';

@injectable()
export class CreateCategoryService {
  constructor(
    @inject('CategoryRepository')
    private categoryRepository: CategoryRepositoryInterface,

    @inject('OrganizationMemberRepository')
    private organizationMemberRepository: OrganizationMemberRepositoryInterface,

    private cache: CacheTrait,
  ) {}

  async execute({ organization_id, ...data }: CreateCategoryDTOType, userId: string): Promise<Category> {
    if (organization_id) {
      const membership = await this.organizationMemberRepository.findByOrganizationAndUser(organization_id, userId);

      if (!membership) {
        throw new AppError('Você não faz parte desta organização', 403);
      }
    }

    const categoryExists = await this.categoryRepository.findByName(data.name, organization_id ? null : userId);

    if (categoryExists) {
      throw new AppError('Você já possui uma categoria com este nome');
    }

    const category = await this.categoryRepository.create({
      ...data,
      userId: organization_id ? null : userId,
      organizationId: organization_id ?? null,
    });

    if (organization_id) {
      await this.cache.delPattern(CacheKeys.categories.listAllPattern());
    } else {
      await this.cache.delPattern(CacheKeys.categories.listPattern(userId));
    }

    return category;
  }
}
