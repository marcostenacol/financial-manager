import { useCallback } from 'react';
import { api } from '../../../services/api';

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
}

export function useRegister() {
  const register = useCallback(async (data: RegisterInput) => {
    await api.post('/auth/register', data);
  }, []);

  return { register };
}
