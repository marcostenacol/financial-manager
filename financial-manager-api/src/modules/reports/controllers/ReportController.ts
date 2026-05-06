import { FastifyRequest, FastifyReply } from 'fastify';
import { injectable, inject } from 'tsyringe';
import { BaseController } from '@/base/http/BaseController';
import { GetDashboardOverviewService } from '../services/GetDashboardOverviewService';
import { GetExpensesByCategoryService } from '../services/GetExpensesByCategoryService';
import { GetMonthlyEvolutionService } from '../services/GetMonthlyEvolutionService';

@injectable()
export class ReportController extends BaseController {
  constructor(
    @inject('GetDashboardOverviewService') private getOverview: GetDashboardOverviewService,
    @inject('GetExpensesByCategoryService') private getExpenses: GetExpensesByCategoryService,
    @inject('GetMonthlyEvolutionService') private getEvolution: GetMonthlyEvolutionService,
  ) {
    super();
  }

  async overview(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const userId = (request.user as any).sub;
    const data = await this.getOverview.execute(userId);
    return this.success(reply, data);
  }

  async expensesByCategory(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const userId = (request.user as any).sub;
    const { month, year } = request.query as { month: string; year: string };
    
    const now = new Date();
    const targetMonth = month ? Number(month) : now.getMonth() + 1;
    const targetYear = year ? Number(year) : now.getFullYear();

    const data = await this.getExpenses.execute(userId, targetMonth, targetYear);
    return this.success(reply, data);
  }

  async evolution(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const userId = (request.user as any).sub;
    const data = await this.getEvolution.execute(userId);
    return this.success(reply, data);
  }
}
