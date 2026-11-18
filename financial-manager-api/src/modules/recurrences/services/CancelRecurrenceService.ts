import { inject, injectable } from 'tsyringe';
import { RecurrenceRepositoryInterface } from '../repositories/contracts/RecurrenceRepositoryInterface';
import { AppError } from '@/shared/errors/AppError';

@injectable()
export class CancelRecurrenceService {
  constructor(
    @inject('RecurrenceRepository')
    private recurrenceRepository: RecurrenceRepositoryInterface,
  ) {}

  async execute(id: string, user_id: string): Promise<void> {
    const recurrence = await this.recurrenceRepository.findById(id);

    if (!recurrence) {
      throw new AppError('Recorrência não encontrada', 404);
    }

    // Verificar se a recorrência pertence ao usuário
    if ((recurrence as any).wallet.userId !== user_id) {
      throw new AppError('Não autorizado', 403);
    }

    // Cancelar a recorrência definindo endsAt como agora
    await this.recurrenceRepository.update(id, {
      endsAt: new Date(),
    });
  }
}
