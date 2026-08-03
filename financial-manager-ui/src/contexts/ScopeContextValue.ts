import { createContext } from 'react';

export type ProfileScope = 'personal' | 'business';

export interface ScopeContextData {
  scope: ProfileScope;
  setScope(scope: ProfileScope): void;
}

export const ScopeContext = createContext<ScopeContextData>({} as ScopeContextData);
