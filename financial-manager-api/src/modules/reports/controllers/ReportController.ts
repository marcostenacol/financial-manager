import { FastifyRequest, FastifyReply } from 'fastify';
import { injectable, inject } from 'tsyringe';
import { BaseController } from '@/base/http/BaseController';
import { GetDashboardOverviewService } from '../services/GetDashboardOverviewService';
import { GetExpensesByCategoryService } from '../services/GetExpensesByCategoryService';
import { GetMonthlyEvolutionService } from '../services/GetMonthlyEvolutionService';
import { ExportDashboardService } from '../services/ExportDashboardService';

@injectable()
export class ReportController extends BaseController {
  constructor(
    @inject('GetDashboardOverviewService') private getOverview: GetDashboardOverviewService,
    @inject('GetExpensesByCategoryService') private getExpenses: GetExpensesByCategoryService,
    @inject('GetMonthlyEvolutionService') private getEvolution: GetMonthlyEvolutionService,
    @inject('ExportDashboardService') private exportDashboard: ExportDashboardService,
  ) {
    super();
  }

  async overview(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const user_id = (request.user as any).sub;
    const { start_date, end_date } = request.query as { start_date?: string; end_date?: string };
    
    const data = await this.getOverview.execute(
      user_id, 
      start_date ? new Date(start_date) : undefined,
      end_date ? new Date(end_date) : undefined
    );
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

  async export(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const user_id = (request.user as any).sub;
    const { format, start_date, end_date } = request.query as { format: 'pdf' | 'excel', start_date?: string, end_date?: string };
    
    if (!['pdf', 'excel'].includes(format)) {
      return reply.status(400).send({ message: 'Formato inválido. Use pdf ou excel.' });
    }

    const buffer = await this.exportDashboard.execute(
      user_id, 
      format, 
      start_date ? new Date(start_date) : undefined,
      end_date ? new Date(end_date) : undefined
    );

    const filename = `relatorio-${new Date().getTime()}.${format === 'pdf' ? 'pdf' : 'xlsx'}`;
    const contentType = format === 'pdf' ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

    return reply
      .header('Content-Type', contentType)
      .header('Content-Disposition', `attachment; filename="${filename}"`)
      .send(buffer);
  }
}
