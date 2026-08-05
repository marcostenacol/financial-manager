export interface DashboardOverviewData {
  total_balance: number;
  monthly_income: number;
  monthly_expense: number;
  last_month_income: number;
  last_month_expense: number;
}

export interface ExpenseByCategoryData {
  category_name: string;
  color: string;
  total: number;
  percentage: number;
}

export interface MonthlyEvolutionData {
  month_name: string;
  income: number;
  expense: number;
  balance: number;
}

export interface DashboardOverviewRange {
  start_date?: string;
  end_date?: string;
}

export interface CashFlowByCostCenterData {
  cost_center_name: string;
  color: string;
  total: number;
  percentage: number;
}

export interface ReportRepositoryInterface {
  getDashboardOverview(userId: string, range?: DashboardOverviewRange, scope?: string, organizationId?: string): Promise<DashboardOverviewData>;
  getExpensesByCategory(userId: string, month: number, year: number, organizationId?: string): Promise<ExpenseByCategoryData[]>;
  getMonthlyEvolution(userId: string, organizationId?: string): Promise<MonthlyEvolutionData[]>;
  getCashFlowByCostCenter(userId: string, month: number, year: number, organizationId?: string): Promise<CashFlowByCostCenterData[]>;
}
