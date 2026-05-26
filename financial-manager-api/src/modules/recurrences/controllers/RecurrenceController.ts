import { FastifyRequest, FastifyReply } from 'fastify';
import { injectable, inject } from 'tsyringe';
import { BaseController } from '@/base/http/BaseController';
import { CreateRecurrenceService } from '../services/CreateRecurrenceService';
import { ListRecurrencesService } from '../services/ListRecurrencesService';
import { CancelRecurrenceService } from '../services/CancelRecurrenceService';
import { ToggleRecurrenceActiveService } from '../services/ToggleRecurrenceActiveService';
import { CreateRecurrenceDTO } from '../dtos/CreateRecurrenceDTO';

@injectable()
export class RecurrenceController extends BaseController {
  constructor(
    @inject('CreateRecurrenceService') private createRecurrence: CreateRecurrenceService,
    @inject('ListRecurrencesService') private listRecurrences: ListRecurrencesService,
    @inject('CancelRecurrenceService') private cancelRecurrence: CancelRecurrenceService,
    @inject('ToggleRecurrenceActiveService') private toggleRecurrence: ToggleRecurrenceActiveService,
  ) {
    super();
  }

  async index(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const userId = (request.user as any).sub;
    const recurrences = await this.listRecurrences.execute(userId);
    return this.success(reply, recurrences);
  }

  async store(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const data = CreateRecurrenceDTO.parse(request.body);
    const userId = (request.user as any).sub;
    const recurrence = await this.createRecurrence.execute(data, userId);
    return this.success(reply, recurrence, 'Recorrência configurada com sucesso', 201);
  }

  async cancel(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { id } = request.params as { id: string };
    const user_id = (request.user as any).sub;
    await this.cancelRecurrence.execute(id, user_id);
    return this.success(reply, null, 'Recorrência cancelada com sucesso');
  }

  async toggle(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { id } = request.params as { id: string };
    const user_id = (request.user as any).sub;
    const recurrence = await this.toggleRecurrence.execute(id, user_id);
    return this.success(reply, recurrence, `Recorrência ${recurrence.isActive ? 'ativada' : 'pausada'} com sucesso`);
  }
}
