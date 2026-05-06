import { FastifyRequest, FastifyReply } from 'fastify';
import { injectable, inject } from 'tsyringe';
import { BaseController } from '@/base/http/BaseController';
import { CreateSavingsGoalService } from '../services/CreateSavingsGoalService';
import { ListSavingsGoalsService } from '../services/ListSavingsGoalsService';
import { UpdateSavingsGoalService } from '../services/UpdateSavingsGoalService';
import { DeleteSavingsGoalService } from '../services/DeleteSavingsGoalService';

@injectable()
export class SavingsGoalController extends BaseController {
  constructor(
    @inject('CreateSavingsGoalService') private createGoal: CreateSavingsGoalService,
    @inject('ListSavingsGoalsService') private listGoals: ListSavingsGoalsService,
    @inject('UpdateSavingsGoalService') private updateGoal: UpdateSavingsGoalService,
    @inject('DeleteSavingsGoalService') private deleteGoal: DeleteSavingsGoalService,
  ) {
    super();
  }

  async index(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const userId = (request.user as any).sub;
    const goals = await this.listGoals.execute(userId);
    return this.success(reply, goals);
  }

  async store(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const data = request.body as any;
    const userId = (request.user as any).sub;
    const goal = await this.createGoal.execute(data, userId);
    return this.success(reply, goal, 'Meta criada com sucesso', 201);
  }

  async update(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { id } = request.params as { id: string };
    const data = request.body as any;
    const userId = (request.user as any).sub;
    const goal = await this.updateGoal.execute(id, data, userId);
    return this.success(reply, goal, 'Meta atualizada com sucesso');
  }

  async delete(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { id } = request.params as { id: string };
    const userId = (request.user as any).sub;
    await this.deleteGoal.execute(id, userId);
    return this.success(reply, null, 'Meta removida com sucesso');
  }
}
