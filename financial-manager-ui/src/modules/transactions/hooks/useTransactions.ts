import { useCallback, useState } from 'react';
import { api } from '../../../services/api';

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: 'income' | 'expense' | 'transfer';
  status: 'pending' | 'completed' | 'cancelled';
  occurredAt: string;
  createdAt: string;
  category?: { name: string; color: string };
  wallet?: { name: string };
  walletId: string;
  categoryId?: string;
  recurrenceId?: string | null;
  recurrence?: {
    period: string;
  };
}

export interface ListTransactionsParams {
  page?: number;
  per_page?: number;
  type?: string;
  search?: string;
  [key: string]: unknown;
}

export interface CreateTransactionInput {
  wallet_id: string;
  category_id?: string;
  type: string;
  amount: number;
  description?: string;
  status?: string;
  occurred_at?: string;
}

export interface UpdateTransactionInput {
  category_id?: string;
  type?: string;
  amount?: number;
  description?: string;
  status?: string;
  occurred_at?: string;
}

export interface TransferInput {
  source_wallet_id: string;
  destination_wallet_id: string;
  category_id: string;
  amount: number;
  description: string;
}

export function useTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const loadTransactions = useCallback(async (params: ListTransactionsParams) => {
    setLoading(true);
    try {
      const response = await api.get('/transactions', { params });
      setTransactions(response.data.data.transactions);
      setTotal(response.data.data.total);
      return response.data.data;
    } finally {
      setLoading(false);
    }
  }, []);

  const createTransaction = useCallback(async (data: CreateTransactionInput) => {
    const response = await api.post('/transactions', data);
    return response.data.data as Transaction;
  }, []);

  const updateTransaction = useCallback(async (id: string, data: UpdateTransactionInput) => {
    const response = await api.put(`/transactions/${id}`, data);
    return response.data.data as Transaction;
  }, []);

  const deleteTransaction = useCallback(async (id: string) => {
    await api.delete(`/transactions/${id}`);
  }, []);

  const transfer = useCallback(async (data: TransferInput) => {
    await api.post('/transactions/transfer', data);
  }, []);

  const exportTransactions = useCallback(async () => {
    const response = await api.get('/transactions/export', { responseType: 'blob' });
    return response.data as Blob;
  }, []);

  const clearAllTransactions = useCallback(async (resetBalances: boolean) => {
    await api.delete('/transactions/clear-all', { data: { reset_balances: resetBalances } });
  }, []);

  return {
    transactions,
    total,
    loading,
    loadTransactions,
    createTransaction,
    updateTransaction,
    deleteTransaction,
    transfer,
    exportTransactions,
    clearAllTransactions,
  };
}
