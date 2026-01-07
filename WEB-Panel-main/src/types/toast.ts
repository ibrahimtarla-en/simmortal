export interface Toast {
  id: string;
  visible: boolean;
  title?: string;
  message?: string;
  type?: 'info' | 'error';
}

export interface ToastProviderContext {
  state: Toast[];
  dismiss: (toastId: string) => void;
  toast: (toast: Omit<Toast, 'id' | 'visible'>) => string;
}
