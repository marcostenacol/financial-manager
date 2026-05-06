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

export interface ReportRepositoryInterface {
  getDashboardOverview(userId: string): Promise<DashboardOverviewData>;
  getExpensesByCategory(userId: string, month: number, year: number): Promise<ExpenseByCategoryData[]>;
}
