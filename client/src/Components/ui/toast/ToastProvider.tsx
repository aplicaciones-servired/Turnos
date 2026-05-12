import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { ToastContext } from './toast.context';
import type { ToastInput, ToastTone } from './toast.types';

type ToastItem = Required<Pick<ToastInput, 'title'>> &
  Omit<ToastInput, 'title'> & {
    id: string;
    tone: ToastTone;
    duration: number;
  };

function buildToastId() {
  return `toast_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const timersRef = useRef<Map<string, number>>(new Map());

  const toneClasses: Record<ToastTone, string> = {
    info: 'border-l-sky-500',
    success: 'border-l-emerald-500',
    warning: 'border-l-amber-500',
    error: 'border-l-rose-500',
  };

  const dismissToast = useCallback((id: string) => {
    const timer = timersRef.current.get(id);
    if (timer !== undefined) {
      window.clearTimeout(timer);
      timersRef.current.delete(id);
    }

    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const clearToasts = useCallback(() => {
    timersRef.current.forEach((timer) => window.clearTimeout(timer));
    timersRef.current.clear();
    setToasts([]);
  }, []);

  const showToast = useCallback(
    (toast: ToastInput) => {
      const id = buildToastId();
      const nextToast: ToastItem = {
        id,
        title: toast.title,
        description: toast.description,
        tone: toast.tone ?? 'info',
        duration: toast.duration ?? 4000,
        actionLabel: toast.actionLabel,
        onAction: toast.onAction,
      };

      setToasts((current) => [nextToast, ...current].slice(0, 4));

      if (nextToast.duration > 0) {
        const timer = window.setTimeout(() => {
          dismissToast(id);
        }, nextToast.duration);

        timersRef.current.set(id, timer);
      }

      return id;
    },
    [dismissToast]
  );

  useEffect(() => () => {
    timersRef.current.forEach((timer) => window.clearTimeout(timer));
    timersRef.current.clear();
  }, []);

  const value = useMemo(
    () => ({ showToast, dismissToast, clearToasts }),
    [showToast, dismissToast, clearToasts]
  );

  const portal = typeof document === 'undefined'
    ? null
    : createPortal(
        <div className="pointer-events-none fixed right-5 top-5 z-80" aria-live="polite" aria-relevant="additions removals">
          <div className="flex w-[min(380px,calc(100vw-32px))] flex-col gap-3">
            {toasts.map((toast) => (
              <article
                key={toast.id}
                className={`pointer-events-auto flex items-start justify-between gap-4 rounded-[18px] border border-slate-200/80 border-l-4 bg-white/95 px-4 py-4 shadow-[0_16px_40px_rgba(15,23,42,0.16)] backdrop-blur-md ${toneClasses[toast.tone]}`}
                role="status"
              >
                <div className="min-w-0 flex-1">
                  <strong className="block text-[0.96rem] leading-5 text-slate-900">{toast.title}</strong>
                  {toast.description && <p className="mt-1 text-sm leading-5 text-slate-500">{toast.description}</p>}
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  {toast.actionLabel && toast.onAction && (
                    <button
                      type="button"
                      className="rounded-[10px] px-2 py-1 text-sm font-semibold text-sky-700 transition hover:bg-sky-50"
                      onClick={() => {
                        toast.onAction?.();
                        dismissToast(toast.id);
                      }}
                    >
                      {toast.actionLabel}
                    </button>
                  )}
                  <button
                    type="button"
                    className="rounded-[10px] px-2 py-1 text-lg leading-none text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
                    onClick={() => dismissToast(toast.id)}
                    aria-label="Cerrar notificación"
                  >
                    ×
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>,
        document.body
      );

  return (
    <ToastContext.Provider value={value}>
      {children}
      {portal}
    </ToastContext.Provider>
  );
}
