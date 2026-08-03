import { useState, useCallback, type ReactNode } from 'react';
import { ScopeContext, type ProfileScope } from './ScopeContextValue';

const STORAGE_KEY = '@FinancialManager:scope';

export const ScopeProvider = ({ children }: { children: ReactNode }) => {
  const [scope, setScopeState] = useState<ProfileScope>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored === 'business' ? 'business' : 'personal';
  });

  const setScope = useCallback((newScope: ProfileScope) => {
    localStorage.setItem(STORAGE_KEY, newScope);
    setScopeState(newScope);
  }, []);

  return (
    <ScopeContext.Provider value={{ scope, setScope }}>
      {children}
    </ScopeContext.Provider>
  );
};
