import { inject, injectable } from 'tsyringe';
import { CategoryRepositoryInterface } from '../repositories/contracts/CategoryRepositoryInterface';
import { CacheTrait } from '@/base/traits/CacheTrait';

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
      throw new Error('Categoria não encontrada');
    }

    if (category.userId && category.userId !== userId) {
      throw new Error('Você não tem permissão para deletar esta categoria');
    }

    if (!category.userId) {
      throw new Error('Categorias de sistema não podem ser deletadas');
    }

    // Nota: O banco de dados deve tratar a integridade referencial ou 
    // podemos mover as transações para uma categoria padrão antes de deletar.
    // Para simplificar, assumimos que categorias com transações não podem ser deletadas (Restrição SQL)
    
    await this.categoryRepository.delete(id);

    await this.cache.del(`categories:user:${userId}`);
  }
}
