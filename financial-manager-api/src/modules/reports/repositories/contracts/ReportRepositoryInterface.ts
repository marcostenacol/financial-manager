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

export interface ReportRepositoryInterface {
  getDashboardOverview(user_id: string, start_date?: Date, end_date?: Date): Promise<DashboardOverviewData>;
  getExpensesByCategory(userId: string, month: number, year: number): Promise<ExpenseByCategoryData[]>;
  getMonthlyEvolution(userId: string): Promise<MonthlyEvolutionData[]>;
}
