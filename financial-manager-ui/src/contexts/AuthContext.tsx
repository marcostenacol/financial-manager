import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';
import { AuthContext } from './AuthContextValue';
import type { User } from './AuthContextValue';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStorageData() {
      const storageUser = localStorage.getItem('@FinancialManager:user');
      const storageToken = localStorage.getItem('@FinancialManager:token');

      if (storageUser && storageToken) {
        setUser(JSON.parse(storageUser));
      }

      setLoading(false);
    }

    loadStorageData();
  }, []);

  const signIn = useCallback(async (credentials: object) => {
    const response = await api.post('/auth/login', credentials);
    const { token, refresh_token, user } = response.data.data;

    localStorage.setItem('@FinancialManager:token', token);
    localStorage.setItem('@FinancialManager:refreshToken', refresh_token);
    localStorage.setItem('@FinancialManager:user', JSON.stringify(user));

    setUser(user);
  }, []);

  const signOut = useCallback(() => {
    localStorage.removeItem('@FinancialManager:token');
    localStorage.removeItem('@FinancialManager:refreshToken');
    localStorage.removeItem('@FinancialManager:user');
    setUser(null);
  }, []);

  const updateUser = useCallback((updatedUser: User) => {
    localStorage.setItem('@FinancialManager:user', JSON.stringify(updatedUser));
    setUser(updatedUser);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};
