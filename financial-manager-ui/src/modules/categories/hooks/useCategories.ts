import { useCallback, useState } from 'react';
import { api } from '../../../services/api';

export interface Category {
  id: string;
  name: string;
  color: string;
  icon: string | null;
  type: 'income' | 'expense' | 'both';
  scope: 'personal' | 'business' | null;
  userId?: string;
}

export interface CreateCategoryInput {
  name: string;
  color: string;
  icon?: string;
  type: 'income' | 'expense' | 'both';
  scope?: 'personal' | 'business';
}

export interface UpdateCategoryInput {
  name?: string;
  color?: string;
  icon?: string;
  type?: 'income' | 'expense' | 'both';
  scope?: 'personal' | 'business';
}

export function useCategories(scope?: 'personal' | 'business') {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const loadCategories = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get('/categories', { params: scope ? { scope } : undefined });
      setCategories(response.data.data);
      return response.data.data as Category[];
    } finally {
      setLoading(false);
    }
  }, [scope]);

  const createCategory = useCallback(async (data: CreateCategoryInput) => {
    const response = await api.post('/categories', data);
    return response.data.data as Category;
  }, []);

  const updateCategory = useCallback(async (id: string, data: UpdateCategoryInput) => {
    const response = await api.put(`/categories/${id}`, data);
    return response.data.data as Category;
  }, []);

  const deleteCategory = useCallback(async (id: string) => {
    await api.delete(`/categories/${id}`);
  }, []);

  return { categories, loading, loadCategories, createCategory, updateCategory, deleteCategory };
}
