import { createContext } from 'react';

export interface ActiveOrganizationContextData {
  activeOrganizationId: string | null;
  setActiveOrganizationId(organizationId: string | null): void;
}

export const ActiveOrganizationContext = createContext<ActiveOrganizationContextData>({} as ActiveOrganizationContextData);
