import { inject, injectable } from 'tsyringe';
import { Recurrence } from '@prisma/client';
import { RecurrenceRepositoryInterface } from '../repositories/contracts/RecurrenceRepositoryInterface';
import { AppError } from '@/shared/errors/AppError';
import { CacheTrait } from '@/base/traits/CacheTrait';
import { CacheKeys } from '@/shared/cache/CacheKeys';

@injectable()
export class ToggleRecurrenceService {
  constructor(
    @inject('RecurrenceRepository')
    private recurrenceRepository: RecurrenceRepositoryInterface,

    private cache: CacheTrait,
  ) {}

  async execute(recurrenceId: string, userId: string): Promise<Recurrence> {
    const recurrence = await this.recurrenceRepository.findById(recurrenceId);

    if (!recurrence || recurrence.wallet.userId !== userId) {
      throw new AppError('Recorrência não encontrada', 404);
    }

    const updated = await this.recurrenceRepository.update(recurrenceId, {
      isActive: !recurrence.isActive,
    });

    await this.cache.del(CacheKeys.recurrences.list(userId));

    return updated;
  }
}
