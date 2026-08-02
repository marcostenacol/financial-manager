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

export interface ReportRepositoryInterface {
  getDashboardOverview(userId: string, range?: DashboardOverviewRange): Promise<DashboardOverviewData>;
  getExpensesByCategory(userId: string, month: number, year: number): Promise<ExpenseByCategoryData[]>;
  getMonthlyEvolution(userId: string): Promise<MonthlyEvolutionData[]>;
}
