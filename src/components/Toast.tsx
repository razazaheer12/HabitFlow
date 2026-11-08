import React from 'react';
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';
import type { ToastItem } from './useToasts';

interface ToastStackProps {
  toasts: ToastItem[];
  onDismiss: (id: number) => void;
}

export const ToastStack: React.FC<ToastStackProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 z-[60] flex flex-col items-center gap-2 w-[calc(100%-2rem)] max-w-sm pointer-events-none"
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`pointer-events-auto w-full flex items-start gap-2.5 px-4 py-3 rounded-2xl border shadow-xl backdrop-blur-md text-sm animate-in slide-in-from-bottom-2 ${
            t.type === 'success'
              ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-200'
              : t.type === 'error'
              ? 'bg-rose-500/15 border-rose-500/30 text-rose-200'
              : 'bg-slate-900 border-slate-700 text-slate-200'
          }`}
        >
          {t.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" />
          ) : t.type === 'error' ? (
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
          ) : (
            <Info className="w-4 h-4 shrink-0 mt-0.5 text-sky-400" />
          )}
          <span className="flex-1 leading-snug">{t.message}</span>
          <button
            type="button"
            onClick={() => onDismiss(t.id)}
            aria-label="Dismiss notification"
            className="shrink-0 p-0.5 rounded-lg opacity-60 hover:opacity-100 transition cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
};
