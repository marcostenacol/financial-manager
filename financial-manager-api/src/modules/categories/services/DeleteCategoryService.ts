import { inject, injectable } from 'tsyringe';
import { Prisma } from '@prisma/client';
import { AppError } from '@/shared/errors/AppError';
import { CategoryRepositoryInterface } from '../repositories/contracts/CategoryRepositoryInterface';
import { CacheTrait } from '@/base/traits/CacheTrait';
import { CacheKeys } from '@/shared/cache/CacheKeys';

@injectable()
export class DeleteCategoryService {
  constructor(
    @inject('CategoryRepository')
    private categoryRepository: CategoryRepositoryInterface,

    private cache: CacheTrait,
  ) {}

  async execute(id: string, userId: string): Promise<void> {
    const category = await this.categoryRepository.findById(id);

    if (!category) {
      throw new AppError('Categoria não encontrada', 404);
    }

    if (category.userId && category.userId !== userId) {
      throw new AppError('Você não tem permissão para deletar esta categoria', 403);
    }

    if (!category.userId) {
      throw new AppError('Categorias de sistema não podem ser deletadas', 403);
    }

    try {
      await this.categoryRepository.delete(id);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2003') {
        throw new AppError('Não é possível excluir uma categoria com transações ou recorrências vinculadas', 409);
      }
      throw error;
    }

    await this.cache.del(CacheKeys.categories.list(userId));
  }
}
