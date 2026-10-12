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

function toWalletIdsParam(walletIds?: string[]): string | undefined {
  return walletIds?.length ? walletIds.join(',') : undefined;
}

export function useReports() {
  const getOverview = useCallback(async (range: ReportDateRange, scope?: 'personal' | 'business', organizationId?: string, walletIds?: string[]) => {
    const response = await api.get('/reports/overview', { params: { ...range, scope, organization_id: organizationId, wallet_ids: toWalletIdsParam(walletIds) } });
    return response.data.data as DashboardOverview;
  }, []);

  const getCashFlowByCostCenter = useCallback(async (organizationId?: string, range?: ReportDateRange, walletIds?: string[]) => {
    const response = await api.get('/reports/cash-flow-by-cost-center', { params: { organization_id: organizationId, ...range, wallet_ids: toWalletIdsParam(walletIds) } });
    return response.data.data as CashFlowByCostCenter[];
  }, []);

  const getExpensesByCategory = useCallback(async (organizationId?: string, range?: ReportDateRange, walletIds?: string[]) => {
    const response = await api.get('/reports/expenses-by-category', { params: { organization_id: organizationId, ...range, wallet_ids: toWalletIdsParam(walletIds) } });
    return response.data.data as ExpenseByCategory[];
  }, []);

  const getMonthlyEvolution = useCallback(async (organizationId?: string, range?: ReportDateRange, walletIds?: string[]) => {
    const response = await api.get('/reports/evolution', { params: { organization_id: organizationId, ...range, wallet_ids: toWalletIdsParam(walletIds) } });
    return response.data.data as MonthlyEvolution[];
  }, []);

  const exportReport = useCallback(async (format: 'pdf' | 'excel', range: ReportDateRange, walletIds?: string[]) => {
    const response = await api.get('/reports/export', {
      params: { format, ...range, wallet_ids: toWalletIdsParam(walletIds) },
      responseType: 'blob',
    });
    return response.data as Blob;
  }, []);

  return { getOverview, getExpensesByCategory, getMonthlyEvolution, getCashFlowByCostCenter, exportReport };
}
