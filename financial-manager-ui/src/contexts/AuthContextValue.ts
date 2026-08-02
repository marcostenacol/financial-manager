import { createContext } from 'react';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  bio?: string;
  type?: string;
}

export interface AuthContextData {
  user: User | null;
  loading: boolean;
  signIn(data: object): Promise<void>;
  signOut(): Promise<void>;
  updateUser(user: User): void;
}

export const AuthContext = createContext<AuthContextData>({} as AuthContextData);
