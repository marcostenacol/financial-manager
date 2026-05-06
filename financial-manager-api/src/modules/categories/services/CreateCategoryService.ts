import { inject, injectable } from 'tsyringe';
import { Category } from '@prisma/client';
import { CategoryRepositoryInterface } from '../repositories/contracts/CategoryRepositoryInterface';
import { CreateCategoryDTOType } from '../dtos/CreateCategoryDTO';
import { AppError } from '@/shared/errors/AppError';
import { CacheTrait } from '@/base/traits/CacheTrait';

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

    await this.cache.del(`categories:user:${userId}`);

    return category;
  }
}
