import { useContext } from 'react';
import { ScopeContext } from './ScopeContextValue';

export const useScope = () => useContext(ScopeContext);
