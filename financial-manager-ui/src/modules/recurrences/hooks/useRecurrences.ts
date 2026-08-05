import { useCallback, useState } from 'react';
import { api } from '../../../services/api';

export interface Recurrence {
  id: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  period: 'daily' | 'weekly' | 'monthly' | 'yearly';
  startsAt: string;
  endsAt: string | null;
  wallet?: { name: string; organizationId?: string | null };
  category?: { name: string; color: string };
  isActive: boolean;
}

export interface CreateRecurrenceInput {
  description: string;
  amount: number;
  type: 'income' | 'expense';
  wallet_id: string;
  category_id: string;
  period: 'daily' | 'weekly' | 'monthly' | 'yearly';
  starts_at: string;
}

export interface UpdateRecurrenceInput {
  description?: string;
  amount?: number;
  type?: 'income' | 'expense';
  category_id?: string;
  period?: 'daily' | 'weekly' | 'monthly' | 'yearly';
  ends_at?: string | null;
}

export function useRecurrences() {
  const [recurrences, setRecurrences] = useState<Recurrence[]>([]);
  const [loading, setLoading] = useState(true);

  const loadRecurrences = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get('/recurrences');
      setRecurrences(response.data.data);
      return response.data.data as Recurrence[];
    } finally {
      setLoading(false);
    }
  }, []);

  const createRecurrence = useCallback(async (data: CreateRecurrenceInput) => {
    const response = await api.post('/recurrences', data);
    return response.data.data as Recurrence;
  }, []);

  const updateRecurrence = useCallback(async (id: string, data: UpdateRecurrenceInput) => {
    const response = await api.put(`/recurrences/${id}`, data);
    return response.data.data as Recurrence;
  }, []);

  const cancelRecurrence = useCallback(async (id: string) => {
    await api.patch(`/recurrences/${id}/cancel`);
  }, []);

  const toggleRecurrence = useCallback(async (id: string) => {
    await api.patch(`/recurrences/${id}/toggle`);
  }, []);

  const runRecurrenceNow = useCallback(async (id: string) => {
    const response = await api.post(`/recurrences/${id}/run`);
    return response.data.data as Recurrence;
  }, []);

  const clearAllRecurrences = useCallback(async (organizationId?: string) => {
    await api.delete('/recurrences/clear-all', { params: organizationId ? { organization_id: organizationId } : undefined });
  }, []);

  return {
    recurrences,
    loading,
    loadRecurrences,
    createRecurrence,
    updateRecurrence,
    cancelRecurrence,
    toggleRecurrence,
    runRecurrenceNow,
    clearAllRecurrences,
  };
}
