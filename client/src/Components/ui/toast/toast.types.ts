export type ToastTone = 'info' | 'success' | 'warning' | 'error';

export type ToastInput = {
  title: string;
  description?: string;
  tone?: ToastTone;
  duration?: number;
  actionLabel?: string;
  onAction?: () => void;
};
