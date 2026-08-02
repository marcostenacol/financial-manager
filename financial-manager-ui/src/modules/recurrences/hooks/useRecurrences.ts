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
  wallet?: { name: string };
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

  const cancelRecurrence = useCallback(async (id: string) => {
    await api.patch(`/recurrences/${id}/cancel`);
  }, []);

  const toggleRecurrence = useCallback(async (id: string) => {
    await api.patch(`/recurrences/${id}/toggle`);
  }, []);

  const clearAllRecurrences = useCallback(async () => {
    await api.delete('/recurrences/clear-all');
  }, []);

  return { recurrences, loading, loadRecurrences, createRecurrence, cancelRecurrence, toggleRecurrence, clearAllRecurrences };
}
