import { useState, useCallback, type ReactNode } from 'react';
import { ScopeContext, type ProfileScope } from './ScopeContextValue';
import { useAuth } from './useAuth';

const STORAGE_KEY = '@FinancialManager:scope';

export const ScopeProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const canUseBusinessScope = user?.type === 'business';

  const [scopeState, setScopeState] = useState<ProfileScope>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored === 'business' ? 'business' : 'personal';
  });

  // Modo empresarial só existe pra conta do tipo "business" — uma conta pessoal
  // não tem organização/centro de custo pra fazer sentido, então nem deve
  // enxergar a opção. `scope` é derivado (não guardado direto) pra corrigir,
  // sem efeito colateral, um valor "business" salvo antes da conta ter mudado
  // de tipo (ou nunca ter sido business).
  const scope: ProfileScope = canUseBusinessScope ? scopeState : 'personal';

  const setScope = useCallback((newScope: ProfileScope) => {
    if (newScope === 'business' && !canUseBusinessScope) return;
    localStorage.setItem(STORAGE_KEY, newScope);
    setScopeState(newScope);
  }, [canUseBusinessScope]);

  return (
    <ScopeContext.Provider value={{ scope, setScope, canUseBusinessScope }}>
      {children}
    </ScopeContext.Provider>
  );
};
