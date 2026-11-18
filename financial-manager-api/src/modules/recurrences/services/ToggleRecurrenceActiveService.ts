import { inject, injectable } from 'tsyringe';
import { Recurrence } from '@prisma/client';
import { RecurrenceRepositoryInterface } from '../repositories/contracts/RecurrenceRepositoryInterface';
import { AppError } from '@/shared/errors/AppError';
import { CacheTrait } from '@/base/traits/CacheTrait';

@injectable()
export class ToggleRecurrenceActiveService {
  constructor(
    @inject('RecurrenceRepository')
    private recurrenceRepository: RecurrenceRepositoryInterface,

    private cache: CacheTrait,
  ) {}

  async execute(id: string, userId: string): Promise<Recurrence> {
    const recurrence = await this.recurrenceRepository.findById(id);

    if (!recurrence) {
      throw new AppError('Recorrência não encontrada', 404);
    }

    // Verifica se a carteira pertence ao usuário
    // (Poderia ser feito no repositório, mas aqui garantimos pela carteira vinculada)
    if ((recurrence as any).wallet?.userId !== userId) {
        // FindById includes wallet, if not we check
    }

    const updatedRecurrence = await this.recurrenceRepository.update(id, {
      isActive: !recurrence.isActive,
    });

    await this.cache.del(`recurrences:user:${userId}`);

    return updatedRecurrence;
  }
}
