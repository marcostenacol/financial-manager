import React, { useCallback, useState } from 'react';
import { ToastContext } from './ToastContextValue';
import type { ToastType } from './ToastContextValue';

interface ToastItem {
  id: number;
  message: string;
  type: ToastType;
}

let counter = 0;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = ++counter;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const colorMap: Record<ToastType, string> = {
    error: 'bg-red-600',
    success: 'bg-green-600',
    info: 'bg-app-accent',
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`${colorMap[toast.type]} text-app-ink text-sm px-4 py-3 rounded shadow-lg max-w-xs`}
          >
            {toast.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
