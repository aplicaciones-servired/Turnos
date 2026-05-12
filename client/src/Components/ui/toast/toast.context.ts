import { createContext } from 'react';
import type { ToastInput } from './toast.types';

type ToastContextValue = {
  showToast: (toast: ToastInput) => string;
  dismissToast: (id: string) => void;
  clearToasts: () => void;
};

export const ToastContext = createContext<ToastContextValue | undefined>(undefined);
