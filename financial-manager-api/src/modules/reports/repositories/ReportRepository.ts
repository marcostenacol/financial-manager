import { prisma } from '@/shared/database/PrismaClient';
import { DashboardOverviewData, DashboardOverviewRange, ExpenseByCategoryData, MonthlyEvolutionData, ReportRepositoryInterface } from './contracts/ReportRepositoryInterface';
import { injectable } from 'tsyringe';

interface DashboardPeriod {
  periodStart: Date;
  periodEnd: Date;
  previousStart: Date;
  previousEnd: Date;
}

@injectable()
export class ReportRepository implements ReportRepositoryInterface {
  private resolvePeriod(range?: DashboardOverviewRange): DashboardPeriod {
    if (range?.start_date || range?.end_date) {
      const periodStart = range.start_date ? new Date(range.start_date) : new Date(0);
      const periodEnd = range.end_date
        ? new Date(new Date(range.end_date).getTime() + 24 * 60 * 60 * 1000)
        : new Date();
      const durationMs = periodEnd.getTime() - periodStart.getTime();

      return {
        periodStart,
        periodEnd,
        previousStart: new Date(periodStart.getTime() - durationMs),
        previousEnd: periodStart,
      };
    }

    const now = new Date();
    const periodStart = new Date(now.getFullYear(), now.getMonth(), 1);

    return {
      periodStart,
      periodEnd: new Date(now.getFullYear(), now.getMonth() + 1, 1),
      previousStart: new Date(now.getFullYear(), now.getMonth() - 1, 1),
      previousEnd: periodStart,
    };
  }

  async getDashboardOverview(userId: string, range?: DashboardOverviewRange): Promise<DashboardOverviewData> {
    const { periodStart, periodEnd, previousStart, previousEnd } = this.resolvePeriod(range);

    const results = await prisma.$queryRawUnsafe<any[]>(`
      WITH wallet_stats AS (
        SELECT COALESCE(SUM(balance), 0) as total_balance
        FROM wallets
        WHERE user_id = $1
      ),
      period_stats AS (
        SELECT
          COALESCE(SUM(CASE WHEN t.type = 'income' THEN t.amount ELSE 0 END), 0) as income,
          COALESCE(SUM(CASE WHEN t.type = 'expense' THEN t.amount ELSE 0 END), 0) as expense
        FROM transactions t
        JOIN wallets w ON t.wallet_id = w.id
        WHERE w.user_id = $1
          AND t.status = 'completed'
          AND t.occurred_at >= $2
          AND t.occurred_at < $3
      ),
      previous_period_stats AS (
        SELECT
          COALESCE(SUM(CASE WHEN t.type = 'income' THEN t.amount ELSE 0 END), 0) as income,
          COALESCE(SUM(CASE WHEN t.type = 'expense' THEN t.amount ELSE 0 END), 0) as expense
        FROM transactions t
        JOIN wallets w ON t.wallet_id = w.id
        WHERE w.user_id = $1
          AND t.status = 'completed'
          AND t.occurred_at >= $4
          AND t.occurred_at < $5
      )
      SELECT
        w.total_balance,
        p.income as monthly_income,
        p.expense as monthly_expense,
        pp.income as last_month_income,
        pp.expense as last_month_expense
      FROM wallet_stats w, period_stats p, previous_period_stats pp
    `, userId, periodStart, periodEnd, previousStart, previousEnd);

    const data = results[0];

    return {
      total_balance: Number(data.total_balance),
      monthly_income: Number(data.monthly_income),
      monthly_expense: Number(data.monthly_expense),
      last_month_income: Number(data.last_month_income),
      last_month_expense: Number(data.last_month_expense),
    };
  }

  async getExpensesByCategory(userId: string, month: number, year: number): Promise<ExpenseByCategoryData[]> {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    const results = await prisma.$queryRawUnsafe<any[]>(`
      WITH category_totals AS (
        SELECT 
          c.name as category_name,
          c.color,
          SUM(t.amount) as total
        FROM transactions t
        JOIN categories c ON t.category_id = c.id
        JOIN wallets w ON t.wallet_id = w.id
        WHERE w.user_id = $1
          AND t.type = 'expense'
          AND t.status = 'completed'
          AND t.occurred_at >= $2
          AND t.occurred_at <= $3
        GROUP BY c.name, c.color
      ),
      total_sum AS (
        SELECT SUM(total) as grand_total FROM category_totals
      )
      SELECT 
        ct.category_name,
        ct.color,
        ct.total,
        CASE WHEN ts.grand_total > 0 
          THEN ROUND((ct.total / ts.grand_total) * 100, 2)
          ELSE 0 
        END as percentage
      FROM category_totals ct, total_sum ts
      ORDER BY ct.total DESC
    `, userId, startDate, endDate);
 
     return results.map(row => ({
       category_name: row.category_name,
       color: row.color,
       total: Number(row.total),
       percentage: Number(row.percentage),
     }));
   }
 
   async getMonthlyEvolution(userId: string): Promise<MonthlyEvolutionData[]> {
     const results = await prisma.$queryRawUnsafe<any[]>(`
       WITH RECURSIVE months AS (
         SELECT date_trunc('month', now()) as month
         UNION ALL
         SELECT date_trunc('month', month - interval '1 month')
         FROM months
         WHERE month > date_trunc('month', now() - interval '5 months')
       ),
       monthly_stats AS (
         SELECT 
           date_trunc('month', t.occurred_at) as month,
           COALESCE(SUM(CASE WHEN t.type = 'income' THEN t.amount ELSE 0 END), 0) as income,
           COALESCE(SUM(CASE WHEN t.type = 'expense' THEN t.amount ELSE 0 END), 0) as expense
         FROM transactions t
         JOIN wallets w ON t.wallet_id = w.id
         WHERE w.user_id = $1
           AND t.status = 'completed'
         GROUP BY 1
       )
       SELECT 
         to_char(m.month, 'Mon') as month_name,
         COALESCE(ms.income, 0) as income,
         COALESCE(ms.expense, 0) as expense,
         (COALESCE(ms.income, 0) - COALESCE(ms.expense, 0)) as balance
       FROM months m
       LEFT JOIN monthly_stats ms ON m.month = ms.month
       ORDER BY m.month ASC
     `, userId);
 
     return results.map(row => ({
       month_name: row.month_name,
       income: Number(row.income),
       expense: Number(row.expense),
       balance: Number(row.balance),
     }));
   }
 }
