import { useCallback, useState } from 'react';
import { api } from '../../../services/api';

export interface Wallet {
  id: string;
  name: string;
  type: 'checking' | 'savings' | 'credit' | 'investment' | 'cash';
  balance: number;
  currency: string;
  isPrimary: boolean;
}

export interface CreateWalletInput {
  name: string;
  type: string;
  balance: number;
  currency?: string;
}

export interface UpdateWalletInput {
  name?: string;
  type?: string;
  balance?: number;
  currency?: string;
}

export function useWallets() {
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [loading, setLoading] = useState(true);

  const loadWallets = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get('/wallets');
      setWallets(response.data.data);
      return response.data.data as Wallet[];
    } finally {
      setLoading(false);
    }
  }, []);

  const createWallet = useCallback(async (data: CreateWalletInput) => {
    const response = await api.post('/wallets', { currency: 'BRL', ...data });
    return response.data.data as Wallet;
  }, []);

  const updateWallet = useCallback(async (id: string, data: UpdateWalletInput) => {
    const response = await api.put(`/wallets/${id}`, data);
    return response.data.data as Wallet;
  }, []);

  const deleteWallet = useCallback(async (id: string) => {
    await api.delete(`/wallets/${id}`);
  }, []);

  const setPrimaryWallet = useCallback(async (id: string) => {
    const response = await api.patch(`/wallets/${id}/primary`);
    return response.data.data as Wallet;
  }, []);

  return { wallets, loading, loadWallets, createWallet, updateWallet, deleteWallet, setPrimaryWallet };
}
