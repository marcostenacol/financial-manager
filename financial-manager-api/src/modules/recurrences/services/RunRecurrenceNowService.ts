import { inject, injectable } from 'tsyringe';
import { Recurrence } from '@prisma/client';
import { RecurrenceRepositoryInterface } from '../repositories/contracts/RecurrenceRepositoryInterface';
import { ProcessRecurrenceService } from './ProcessRecurrenceService';
import { AppError } from '@/shared/errors/AppError';
import { isOwnedByActor } from '@/shared/authorization/ownership';

@injectable()
export class RunRecurrenceNowService {
  constructor(
    @inject('RecurrenceRepository')
    private recurrenceRepository: RecurrenceRepositoryInterface,

    @inject('ProcessRecurrenceService')
    private processRecurrence: ProcessRecurrenceService,
  ) {}

  async execute(recurrenceId: string, userId: string, organizationIds: string[] = []): Promise<Recurrence> {
    const recurrence = await this.recurrenceRepository.findById(recurrenceId);

    if (!recurrence || !isOwnedByActor(recurrence.wallet, userId, organizationIds)) {
      throw new AppError('Recorrência não encontrada', 404);
    }

    if (!recurrence.isActive) {
      throw new AppError('Recorrências pausadas não podem ser executadas manualmente', 422);
    }

    await this.processRecurrence.runNow(recurrence);

    const updated = await this.recurrenceRepository.findById(recurrenceId);
    return updated!;
  }
}
