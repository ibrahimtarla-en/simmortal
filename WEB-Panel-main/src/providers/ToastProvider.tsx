'use client';
import React, { createContext, useMemo, useState } from 'react';
import { Toast, ToastProviderContext } from '@/types/toast';

export const ToastContext = createContext<ToastProviderContext | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<Toast[]>([]);
  const api = useMemo(
    () => ({
      toast: (newToast: Omit<Toast, 'id' | 'visible'>) => {
        const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
        const toastWithId: Toast = { id, type: 'info', ...newToast, visible: true };
        setState((prev) => [...prev, toastWithId]);

        return id;
      },

      dismiss: (toastId: string) => {
        setState((prev) => prev.filter((toast) => toast.id !== toastId));
      },
    }),
    [],
  );
  return <ToastContext.Provider value={{ ...api, state }}>{children}</ToastContext.Provider>;
}
