import { inject, injectable } from 'tsyringe';
import { Recurrence } from '@prisma/client';
import { RecurrenceRepositoryInterface } from '../repositories/contracts/RecurrenceRepositoryInterface';
import { AppError } from '@/shared/errors/AppError';
import { CacheTrait } from '@/base/traits/CacheTrait';

@injectable()
export class CancelRecurrenceService {
  constructor(
    @inject('RecurrenceRepository')
    private recurrenceRepository: RecurrenceRepositoryInterface,

    private cache: CacheTrait,
  ) {}

  async execute(recurrenceId: string, userId: string): Promise<Recurrence> {
    const recurrence = await this.recurrenceRepository.findById(recurrenceId);

    if (!recurrence || (recurrence as any).wallet.userId !== userId) {
      throw new AppError('Recorrência não encontrada', 404);
    }

    const updated = await this.recurrenceRepository.update(recurrenceId, {
      endsAt: new Date(),
      isActive: false,
    });

    await this.cache.del(`recurrences:user:${userId}`);

    return updated;
  }
}
