import { FastifyRequest, FastifyReply } from 'fastify';
import { injectable, inject } from 'tsyringe';
import { BaseController } from '@/base/http/BaseController';
import { CreateRecurrenceService } from '../services/CreateRecurrenceService';
import { ListRecurrencesService } from '../services/ListRecurrencesService';

@injectable()
export class RecurrenceController extends BaseController {
  constructor(
    @inject('CreateRecurrenceService') private createRecurrence: CreateRecurrenceService,
    @inject('ListRecurrencesService') private listRecurrences: ListRecurrencesService,
  ) {
    super();
  }

  async index(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const userId = (request.user as any).sub;
    const recurrences = await this.listRecurrences.execute(userId);
    return this.success(reply, recurrences);
  }

  async store(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const data = request.body as any;
    const userId = (request.user as any).sub;
    const recurrence = await this.createRecurrence.execute(data, userId);
    return this.success(reply, recurrence, 'Recorrência configurada com sucesso', 201);
  }
}
