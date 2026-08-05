import { useContext } from 'react';
import { ActiveOrganizationContext } from './ActiveOrganizationContextValue';

export const useActiveOrganization = () => useContext(ActiveOrganizationContext);
