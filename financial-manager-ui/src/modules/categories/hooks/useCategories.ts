import { useCallback, useState } from 'react';
import { api } from '../../../services/api';

export interface Category {
  id: string;
  name: string;
  color: string;
  icon: string | null;
  type: 'income' | 'expense' | 'both';
  userId?: string;
}

export interface CreateCategoryInput {
  name: string;
  color: string;
  icon?: string;
  type: 'income' | 'expense' | 'both';
}

export interface UpdateCategoryInput {
  name?: string;
  color?: string;
  icon?: string;
  type?: 'income' | 'expense' | 'both';
}

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const loadCategories = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get('/categories');
      setCategories(response.data.data);
      return response.data.data as Category[];
    } finally {
      setLoading(false);
    }
  }, []);

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
