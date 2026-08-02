import { useCallback, useState } from 'react';
import { api } from '../../../services/api';

export interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string | null;
  color: string;
}

export interface CreateSavingsGoalInput {
  name: string;
  target_amount: number;
  current_amount: number;
  deadline: string | null;
  color: string;
}

export interface UpdateSavingsGoalInput {
  name?: string;
  target_amount?: number;
  current_amount?: number;
  deadline?: string | null;
  color?: string;
}

export function useSavingsGoals() {
  const [goals, setGoals] = useState<SavingsGoal[]>([]);
  const [loading, setLoading] = useState(true);

  const loadGoals = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get('/savings-goals');
      setGoals(response.data.data);
      return response.data.data as SavingsGoal[];
    } finally {
      setLoading(false);
    }
  }, []);

  const createGoal = useCallback(async (data: CreateSavingsGoalInput) => {
    const response = await api.post('/savings-goals', data);
    return response.data.data as SavingsGoal;
  }, []);

  const updateGoal = useCallback(async (id: string, data: UpdateSavingsGoalInput) => {
    const response = await api.put(`/savings-goals/${id}`, data);
    return response.data.data as SavingsGoal;
  }, []);

  const deleteGoal = useCallback(async (id: string) => {
    await api.delete(`/savings-goals/${id}`);
  }, []);

  const clearAllGoals = useCallback(async () => {
    await api.delete('/savings-goals/clear-all');
  }, []);

  return { goals, loading, loadGoals, createGoal, updateGoal, deleteGoal, clearAllGoals };
}
