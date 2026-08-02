import { FastifyRequest, FastifyReply } from 'fastify';
import { injectable, inject } from 'tsyringe';
import { BaseController } from '@/base/http/BaseController';
import { GetDashboardOverviewService } from '../services/GetDashboardOverviewService';
import { GetExpensesByCategoryService } from '../services/GetExpensesByCategoryService';
import { GetMonthlyEvolutionService } from '../services/GetMonthlyEvolutionService';
import { ExportReportService } from '../services/ExportReportService';

@injectable()
export class ReportController extends BaseController {
  constructor(
    @inject('GetDashboardOverviewService') private getOverview: GetDashboardOverviewService,
    @inject('GetExpensesByCategoryService') private getExpenses: GetExpensesByCategoryService,
    @inject('GetMonthlyEvolutionService') private getEvolution: GetMonthlyEvolutionService,
    @inject('ExportReportService') private exportReport: ExportReportService,
  ) {
    super();
  }

  async export(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const userId = request.user.sub;
    const { format, start_date, end_date } = request.query as {
      format: 'pdf' | 'excel';
      start_date?: string;
      end_date?: string;
    };

    const buffer = await this.exportReport.execute(userId, { format, start_date, end_date });

    const isExcel = format === 'excel';
    reply
      .header(
        'Content-Type',
        isExcel ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' : 'application/pdf',
      )
      .header('Content-Disposition', `attachment; filename="relatorio.${isExcel ? 'xlsx' : 'pdf'}"`)
      .send(buffer);
  }

  async overview(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const userId = request.user.sub;
    const { start_date, end_date } = request.query as { start_date?: string; end_date?: string };
    const data = await this.getOverview.execute(userId, { start_date, end_date });
    return this.success(reply, data);
  }

  async expensesByCategory(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const userId = request.user.sub;
    const { month, year } = request.query as { month: string; year: string };
    
    const now = new Date();
    const targetMonth = month ? Number(month) : now.getMonth() + 1;
    const targetYear = year ? Number(year) : now.getFullYear();

    const data = await this.getExpenses.execute(userId, targetMonth, targetYear);
    return this.success(reply, data);
  }

  async evolution(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const userId = request.user.sub;
    const data = await this.getEvolution.execute(userId);
    return this.success(reply, data);
  }
}
