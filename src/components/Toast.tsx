import React from 'react';
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';
import type { ToastItem, ToastType } from './useToasts';

interface ToastStackProps {
  toasts: ToastItem[];
  onDismiss: (id: number) => void;
}

const TOAST_STYLE: Record<ToastType, { bar: string; icon: string; Icon: React.FC<{ className?: string }> }> = {
  success: { bar: 'border-l-success-fill', icon: 'text-success-fill', Icon: CheckCircle2 },
  error: { bar: 'border-l-error-fill', icon: 'text-error-fill', Icon: AlertTriangle },
  info: { bar: 'border-l-info-fill', icon: 'text-info-fill', Icon: Info }
};

export const ToastStack: React.FC<ToastStackProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 z-[60] flex flex-col items-center gap-2 w-[calc(100%-2rem)] max-w-sm pointer-events-none"
    >
      {toasts.map((t) => {
        const s = TOAST_STYLE[t.type] ?? TOAST_STYLE.info;
        const Icon = s.Icon;
        return (
          <div
            key={t.id}
            className={`pointer-events-auto w-full flex items-start gap-2.5 px-4 py-3 rounded-xl bg-surface border border-border border-l-4 ${s.bar} shadow-dropdown text-sm text-ink animate-in slide-in-from-bottom-2`}
          >
            <Icon className={`w-4 h-4 shrink-0 mt-0.5 ${s.icon}`} />
            <span className="flex-1 leading-snug">{t.message}</span>
            <button
              type="button"
              onClick={() => onDismiss(t.id)}
              aria-label="Dismiss notification"
              className="shrink-0 p-0.5 rounded-lg text-ink-muted hover:text-ink hover:bg-bg-secondary transition cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
