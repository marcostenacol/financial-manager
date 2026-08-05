import { FastifyRequest, FastifyReply } from 'fastify';
import { injectable, inject } from 'tsyringe';
import { BaseController } from '@/base/http/BaseController';
import { GetDashboardOverviewService } from '../services/GetDashboardOverviewService';
import { GetExpensesByCategoryService } from '../services/GetExpensesByCategoryService';
import { GetMonthlyEvolutionService } from '../services/GetMonthlyEvolutionService';
import { GetCashFlowByCostCenterService } from '../services/GetCashFlowByCostCenterService';
import { ExportReportService } from '../services/ExportReportService';
import { AppError } from '@/shared/errors/AppError';

@injectable()
export class ReportController extends BaseController {
  constructor(
    @inject('GetDashboardOverviewService') private getOverview: GetDashboardOverviewService,
    @inject('GetExpensesByCategoryService') private getExpenses: GetExpensesByCategoryService,
    @inject('GetMonthlyEvolutionService') private getEvolution: GetMonthlyEvolutionService,
    @inject('GetCashFlowByCostCenterService') private getCashFlowByCostCenter: GetCashFlowByCostCenterService,
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

  private assertOrganizationAccess(request: FastifyRequest, organizationId?: string): void {
    if (organizationId && !request.organizationIds.includes(organizationId)) {
      throw new AppError('Você não faz parte desta organização', 403);
    }
  }

  async overview(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const userId = request.user.sub;
    const { start_date, end_date, scope, organization_id } = request.query as { start_date?: string; end_date?: string; scope?: string; organization_id?: string };
    this.assertOrganizationAccess(request, organization_id);
    const data = await this.getOverview.execute(userId, { start_date, end_date }, scope, organization_id);
    return this.success(reply, data);
  }

  async cashFlowByCostCenter(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const userId = request.user.sub;
    const { month, year, organization_id } = request.query as { month: string; year: string; organization_id?: string };
    this.assertOrganizationAccess(request, organization_id);

    const now = new Date();
    const targetMonth = month ? Number(month) : now.getMonth() + 1;
    const targetYear = year ? Number(year) : now.getFullYear();

    const data = await this.getCashFlowByCostCenter.execute(userId, targetMonth, targetYear, organization_id);
    return this.success(reply, data);
  }

  async expensesByCategory(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const userId = request.user.sub;
    const { month, year, organization_id } = request.query as { month: string; year: string; organization_id?: string };
    this.assertOrganizationAccess(request, organization_id);

    const now = new Date();
    const targetMonth = month ? Number(month) : now.getMonth() + 1;
    const targetYear = year ? Number(year) : now.getFullYear();

    const data = await this.getExpenses.execute(userId, targetMonth, targetYear, organization_id);
    return this.success(reply, data);
  }

  async evolution(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const userId = request.user.sub;
    const { organization_id } = request.query as { organization_id?: string };
    this.assertOrganizationAccess(request, organization_id);
    const data = await this.getEvolution.execute(userId, organization_id);
    return this.success(reply, data);
  }
}
