import { useCallback, useState } from 'react';
import { api } from '../../../services/api';

export interface CostCenter {
  id: string;
  name: string;
  color: string;
  organizationId?: string | null;
}

export interface CreateCostCenterInput {
  name: string;
  color?: string;
  organization_id?: string;
}

export interface UpdateCostCenterInput {
  name?: string;
  color?: string;
}

export function useCostCenters() {
  const [costCenters, setCostCenters] = useState<CostCenter[]>([]);
  const [loading, setLoading] = useState(true);

  const loadCostCenters = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get('/cost-centers');
      setCostCenters(response.data.data);
      return response.data.data as CostCenter[];
    } finally {
      setLoading(false);
    }
  }, []);

  const createCostCenter = useCallback(async (data: CreateCostCenterInput) => {
    const response = await api.post('/cost-centers', data);
    return response.data.data as CostCenter;
  }, []);

  const updateCostCenter = useCallback(async (id: string, data: UpdateCostCenterInput) => {
    const response = await api.put(`/cost-centers/${id}`, data);
    return response.data.data as CostCenter;
  }, []);

  const deleteCostCenter = useCallback(async (id: string) => {
    await api.delete(`/cost-centers/${id}`);
  }, []);

  return { costCenters, loading, loadCostCenters, createCostCenter, updateCostCenter, deleteCostCenter };
}
