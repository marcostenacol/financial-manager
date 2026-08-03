import { useCallback } from 'react';
import { api } from '../../../services/api';

export interface DashboardOverview {
  total_balance: number;
  monthly_income: number;
  monthly_expense: number;
  last_month_income: number;
  last_month_expense: number;
}

export interface ExpenseByCategory {
  category_name: string;
  color: string;
  total: number;
  percentage: number;
}

export interface MonthlyEvolution {
  month_name: string;
  income: number;
  expense: number;
  balance: number;
}

export interface ReportDateRange {
  start_date?: string;
  end_date?: string;
}

export interface CashFlowByCostCenter {
  cost_center_name: string;
  color: string;
  total: number;
  percentage: number;
}

export function useReports() {
  const getOverview = useCallback(async (range: ReportDateRange, scope?: 'personal' | 'business') => {
    const response = await api.get('/reports/overview', { params: { ...range, scope } });
    return response.data.data as DashboardOverview;
  }, []);

  const getCashFlowByCostCenter = useCallback(async () => {
    const response = await api.get('/reports/cash-flow-by-cost-center');
    return response.data.data as CashFlowByCostCenter[];
  }, []);

  const getExpensesByCategory = useCallback(async () => {
    const response = await api.get('/reports/expenses-by-category');
    return response.data.data as ExpenseByCategory[];
  }, []);

  const getMonthlyEvolution = useCallback(async () => {
    const response = await api.get('/reports/evolution');
    return response.data.data as MonthlyEvolution[];
  }, []);

  const exportReport = useCallback(async (format: 'pdf' | 'excel', range: ReportDateRange) => {
    const response = await api.get('/reports/export', {
      params: { format, ...range },
      responseType: 'blob',
    });
    return response.data as Blob;
  }, []);

  return { getOverview, getExpensesByCategory, getMonthlyEvolution, getCashFlowByCostCenter, exportReport };
}
