import { useState, useCallback, type ReactNode } from 'react';
import { ActiveOrganizationContext } from './ActiveOrganizationContextValue';

const STORAGE_KEY = '@FinancialManager:activeOrganization';

export const ActiveOrganizationProvider = ({ children }: { children: ReactNode }) => {
  const [activeOrganizationId, setActiveOrganizationIdState] = useState<string | null>(() => {
    return localStorage.getItem(STORAGE_KEY);
  });

  const setActiveOrganizationId = useCallback((organizationId: string | null) => {
    if (organizationId) {
      localStorage.setItem(STORAGE_KEY, organizationId);
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
    setActiveOrganizationIdState(organizationId);
  }, []);

  return (
    <ActiveOrganizationContext.Provider value={{ activeOrganizationId, setActiveOrganizationId }}>
      {children}
    </ActiveOrganizationContext.Provider>
  );
};
