import { inject, injectable } from 'tsyringe';
import { Recurrence } from '@prisma/client';
import { RecurrenceRepositoryInterface } from '../repositories/contracts/RecurrenceRepositoryInterface';
import { CategoryRepositoryInterface } from '@/modules/categories/repositories/contracts/CategoryRepositoryInterface';
import { UpdateRecurrenceDTOType } from '../dtos/UpdateRecurrenceDTO';
import { AppError } from '@/shared/errors/AppError';
import { CacheTrait } from '@/base/traits/CacheTrait';
import { CacheKeys } from '@/shared/cache/CacheKeys';
import { isOwnedByActor } from '@/shared/authorization/ownership';

@injectable()
export class UpdateRecurrenceService {
  constructor(
    @inject('RecurrenceRepository')
    private recurrenceRepository: RecurrenceRepositoryInterface,

    @inject('CategoryRepository')
    private categoryRepository: CategoryRepositoryInterface,

    private cache: CacheTrait,
  ) {}

  async execute(
    recurrenceId: string,
    data: UpdateRecurrenceDTOType,
    userId: string,
    organizationIds: string[] = [],
  ): Promise<Recurrence> {
    const recurrence = await this.recurrenceRepository.findById(recurrenceId);

    if (!recurrence || !isOwnedByActor(recurrence.wallet, userId, organizationIds)) {
      throw new AppError('Recorrência não encontrada', 404);
    }

    if (data.category_id) {
      const category = await this.categoryRepository.findById(data.category_id);

      if (!category) {
        throw new AppError('Categoria não encontrada', 404);
      }

      if (category.scope && category.scope !== recurrence.wallet.scope) {
        throw new AppError('Esta categoria não é compatível com o escopo da carteira', 422);
      }
    }

    const updated = await this.recurrenceRepository.update(recurrenceId, {
      ...(data.description !== undefined && { description: data.description }),
      ...(data.amount !== undefined && { amount: data.amount }),
      ...(data.type !== undefined && { type: data.type }),
      ...(data.category_id !== undefined && { categoryId: data.category_id }),
      ...(data.period !== undefined && { period: data.period }),
      ...(data.ends_at !== undefined && { endsAt: data.ends_at ? new Date(data.ends_at) : null }),
    });

    await this.cache.del(CacheKeys.recurrences.list(userId));

    return updated;
  }
}
