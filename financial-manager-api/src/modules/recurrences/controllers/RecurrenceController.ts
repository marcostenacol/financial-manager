import { FastifyRequest, FastifyReply } from 'fastify';
import { injectable, inject } from 'tsyringe';
import { BaseController } from '@/base/http/BaseController';
import { CreateRecurrenceService } from '../services/CreateRecurrenceService';
import { ListRecurrencesService } from '../services/ListRecurrencesService';
import { ToggleRecurrenceService } from '../services/ToggleRecurrenceService';
import { CancelRecurrenceService } from '../services/CancelRecurrenceService';
import { CreateRecurrenceDTO } from '../dtos/CreateRecurrenceDTO';

@injectable()
export class RecurrenceController extends BaseController {
  constructor(
    @inject('CreateRecurrenceService') private createRecurrence: CreateRecurrenceService,
    @inject('ListRecurrencesService') private listRecurrences: ListRecurrencesService,
    @inject('ToggleRecurrenceService') private toggleRecurrence: ToggleRecurrenceService,
    @inject('CancelRecurrenceService') private cancelRecurrence: CancelRecurrenceService,
  ) {
    super();
  }

  async index(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const userId = request.user.sub;
    const recurrences = await this.listRecurrences.execute(userId);
    return this.success(reply, recurrences);
  }

  async store(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const data = CreateRecurrenceDTO.parse(request.body);
    const userId = request.user.sub;
    const recurrence = await this.createRecurrence.execute(data, userId);
    return this.success(reply, recurrence, 'Recorrência configurada com sucesso', 201);
  }

  async toggle(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { id } = request.params as { id: string };
    const userId = request.user.sub;
    const recurrence = await this.toggleRecurrence.execute(id, userId);
    return this.success(reply, recurrence, 'Status da recorrência alterado com sucesso');
  }

  async cancel(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { id } = request.params as { id: string };
    const userId = request.user.sub;
    const recurrence = await this.cancelRecurrence.execute(id, userId);
    return this.success(reply, recurrence, 'Recorrência cancelada com sucesso');
  }
}
