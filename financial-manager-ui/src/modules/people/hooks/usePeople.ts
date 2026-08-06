import { useCallback, useState } from 'react';
import { api } from '../../../services/api';

export type PixKeyType = 'CPF' | 'CNPJ' | 'EMAIL' | 'PHONE' | 'RANDOM';
export type PaymentFrequency = 'ONE_TIME' | 'MONTHLY';
export type SettleDirection = 'they_owe_me' | 'i_owe_them';

export interface Person {
  id: string;
  userId: string | null;
  organizationId: string | null;
  scope: 'personal' | 'business';
  name: string;
  theyOweMe: string;
  iOweThem: string;
  paymentFrequency: PaymentFrequency;
  isPaid: boolean;
  lastPaidPeriod: string | null;
  pixKey: string;
  pixKeyType: PixKeyType;
  pixCity: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePersonInput {
  name: string;
  they_owe_me?: number;
  i_owe_them?: number;
  payment_frequency?: PaymentFrequency;
  pix_key: string;
  pix_key_type: PixKeyType;
  pix_city?: string;
  notes?: string;
  scope?: 'personal' | 'business';
  organization_id?: string;
}

export type UpdatePersonInput = Partial<Omit<CreatePersonInput, 'scope' | 'organization_id'>>;

export interface PersonPixQrCode {
  payload: string;
  qrCodeDataUrl: string;
}

export interface SettlePersonDebtInput {
  direction: SettleDirection;
  wallet_id: string;
  category_id: string;
}

/**
 * "Pago" para MONTHLY vale só para o mês corrente (lastPaidPeriod) — sem isso
 * a UI mostraria como pago para sempre um pagamento recorrente já quitado num
 * mês passado.
 */
export function isPersonPaidThisPeriod(person: Person): boolean {
  if (person.paymentFrequency === 'ONE_TIME') return false;

  const now = new Date();
  const currentPeriod = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}`;

  return person.lastPaidPeriod === currentPeriod;
}

export function usePeople(scope?: 'personal' | 'business') {
  const [people, setPeople] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);

  const loadPeople = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get('/people', { params: scope ? { scope } : undefined });
      setPeople(response.data.data);
      return response.data.data as Person[];
    } finally {
      setLoading(false);
    }
  }, [scope]);

  const createPerson = useCallback(async (data: CreatePersonInput) => {
    const response = await api.post('/people', data);
    return response.data.data as Person;
  }, []);

  const updatePerson = useCallback(async (id: string, data: UpdatePersonInput) => {
    const response = await api.put(`/people/${id}`, data);
    return response.data.data as Person;
  }, []);

  const deletePerson = useCallback(async (id: string) => {
    await api.delete(`/people/${id}`);
  }, []);

  const settlePersonDebt = useCallback(async (id: string, data: SettlePersonDebtInput) => {
    const response = await api.post(`/people/${id}/settle-debt`, data);
    return response.data.data as { person: Person; transaction: unknown };
  }, []);

  const getPersonPixQrCode = useCallback(async (id: string) => {
    const response = await api.get(`/people/${id}/pix-qrcode`);
    return response.data.data as PersonPixQrCode;
  }, []);

  return {
    people,
    loading,
    loadPeople,
    createPerson,
    updatePerson,
    deletePerson,
    settlePersonDebt,
    getPersonPixQrCode,
  };
}
