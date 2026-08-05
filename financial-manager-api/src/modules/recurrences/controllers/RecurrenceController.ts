import { FastifyRequest, FastifyReply } from 'fastify';
import { injectable, inject } from 'tsyringe';
import { BaseController } from '@/base/http/BaseController';
import { CreateRecurrenceService } from '../services/CreateRecurrenceService';
import { ListRecurrencesService } from '../services/ListRecurrencesService';
import { ToggleRecurrenceService } from '../services/ToggleRecurrenceService';
import { CancelRecurrenceService } from '../services/CancelRecurrenceService';
import { ClearAllRecurrencesService } from '../services/ClearAllRecurrencesService';
import { UpdateRecurrenceService } from '../services/UpdateRecurrenceService';
import { RunRecurrenceNowService } from '../services/RunRecurrenceNowService';
import { CreateRecurrenceDTO } from '../dtos/CreateRecurrenceDTO';
import { UpdateRecurrenceDTO } from '../dtos/UpdateRecurrenceDTO';
import { AppError } from '@/shared/errors/AppError';

@injectable()
export class RecurrenceController extends BaseController {
  constructor(
    @inject('CreateRecurrenceService') private createRecurrence: CreateRecurrenceService,
    @inject('ListRecurrencesService') private listRecurrences: ListRecurrencesService,
    @inject('ToggleRecurrenceService') private toggleRecurrence: ToggleRecurrenceService,
    @inject('CancelRecurrenceService') private cancelRecurrence: CancelRecurrenceService,
    @inject('ClearAllRecurrencesService') private clearAllRecurrences: ClearAllRecurrencesService,
    @inject('UpdateRecurrenceService') private updateRecurrence: UpdateRecurrenceService,
    @inject('RunRecurrenceNowService') private runRecurrenceNow: RunRecurrenceNowService,
  ) {
    super();
  }

  async index(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const userId = request.user.sub;
    const recurrences = await this.listRecurrences.execute(userId, request.organizationIds);
    return this.success(reply, recurrences);
  }

  async store(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const data = CreateRecurrenceDTO.parse(request.body);
    const userId = request.user.sub;
    const recurrence = await this.createRecurrence.execute(data, userId, request.organizationIds);
    return this.success(reply, recurrence, 'Recorrência configurada com sucesso', 201);
  }

  async toggle(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { id } = request.params as { id: string };
    const userId = request.user.sub;
    const recurrence = await this.toggleRecurrence.execute(id, userId, request.organizationIds);
    return this.success(reply, recurrence, 'Status da recorrência alterado com sucesso');
  }

  async cancel(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { id } = request.params as { id: string };
    const userId = request.user.sub;
    const recurrence = await this.cancelRecurrence.execute(id, userId, request.organizationIds);
    return this.success(reply, recurrence, 'Recorrência cancelada com sucesso');
  }

  async update(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { id } = request.params as { id: string };
    const data = UpdateRecurrenceDTO.parse(request.body);
    const userId = request.user.sub;
    const recurrence = await this.updateRecurrence.execute(id, data, userId, request.organizationIds);
    return this.success(reply, recurrence, 'Recorrência atualizada com sucesso');
  }

  async runNow(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { id } = request.params as { id: string };
    const userId = request.user.sub;
    const recurrence = await this.runRecurrenceNow.execute(id, userId, request.organizationIds);
    return this.success(reply, recurrence, 'Recorrência executada com sucesso');
  }

  async clearAll(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const userId = request.user.sub;
    const { organization_id } = request.query as { organization_id?: string };

    if (organization_id && !request.organizationIds.includes(organization_id)) {
      throw new AppError('Você não faz parte desta organização', 403);
    }

    await this.clearAllRecurrences.execute(userId, organization_id);
    return this.success(reply, null, 'Recorrências removidas com sucesso');
  }
}
