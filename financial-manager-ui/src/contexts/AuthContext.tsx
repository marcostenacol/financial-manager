import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  bio?: string;
  type?: string;
}

interface AuthContextData {
  user: User | null;
  loading: boolean;
  signIn(data: object): Promise<void>;
  signOut(): void;
  updateUser(user: User): void;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

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

export const useAuth = () => useContext(AuthContext);
