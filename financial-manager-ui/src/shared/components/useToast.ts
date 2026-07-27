import { useContext } from 'react';
import { ToastContext } from './ToastContextValue';
import type { ToastContextValue } from './ToastContextValue';

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
