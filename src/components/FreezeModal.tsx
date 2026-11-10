import React, { useState } from 'react';
import { X, ShieldAlert, Palmtree, Thermometer, Plane, Zap } from 'lucide-react';
import { StreakFreeze } from '../types';
import { formatDisplayDate } from '../domain/date';
import { useModalA11y } from './useModalA11y';

interface FreezeModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: string;
  isGloballyFrozen: boolean;
  activeFreezes: StreakFreeze[];
  remainingAllowance: number;
  onToggleGlobalFreeze: (date: string, reason: string) => void;
}

const REASONS = [
  { id: 'sick', label: 'Sick / Recovery', icon: Thermometer },
  { id: 'travel', label: 'Travel / Vacation', icon: Plane },
  { id: 'holiday', label: 'Holiday Mode', icon: Palmtree },
  { id: 'busy', label: 'Heavy Workload / Emergency', icon: Zap }
];

export const FreezeModal: React.FC<FreezeModalProps> = ({
  isOpen,
  onClose,
  selectedDate,
  isGloballyFrozen,
  remainingAllowance,
  onToggleGlobalFreeze
}) => {
  const [selectedReason, setSelectedReason] = useState('Holiday Mode');
  const dialogRef = useModalA11y<HTMLDivElement>(isOpen, onClose);

  if (!isOpen) return null;

  const exhausted = remainingAllowance <= 0 && !isGloballyFrozen;

  const handleAction = () => {
    onToggleGlobalFreeze(selectedDate, selectedReason);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/40 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="freeze-modal-title"
        className="w-full max-w-md bg-surface border border-border rounded-3xl p-6 shadow-modal relative animate-in fade-in zoom-in-95"
      >
        <div className="flex items-center justify-between pb-3 border-b border-border mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-info-bg border border-info-border flex items-center justify-center text-info-fill">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <h3 id="freeze-modal-title" className="text-base font-bold text-ink tracking-tight">Streak Freeze & Protection</h3>
              <p className="text-xs text-ink-secondary">{formatDisplayDate(selectedDate)}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close"
            className="w-8 h-8 rounded-xl bg-bg-secondary text-ink-muted hover:text-ink hover:bg-border flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-4">
          {/* Explanation Banner */}
          <div className="p-3.5 rounded-2xl bg-info-bg border border-info-border text-xs text-info leading-relaxed">
            <span className="font-semibold block mb-0.5">How Streak Freeze Works:</span>
            Life happens! Freezing protects your hard-earned streak on sick or travel days. Your continuous streak score won't reset to zero.
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-bg-secondary border border-border">
            <span className="text-xs text-ink-secondary font-medium">Monthly Freeze Allowance</span>
            <span
              className={`text-xs tabular-nums font-bold ${
                remainingAllowance <= 0 ? 'text-error' : 'text-info'
              }`}
            >
              {remainingAllowance <= 0 ? 'No freezes left' : `${remainingAllowance} available`}
            </span>
          </div>

          {exhausted && (
            <div
              role="alert"
              className="p-3 rounded-2xl bg-error-bg border border-error-border text-xs text-error leading-relaxed"
            >
              You've used every freeze token for this month. Your allowance resets on the 1st.
              Existing freezes can still be deactivated.
            </div>
          )}

          {/* Current Status */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-ink-secondary block">Select Reason</label>
            <div className="grid grid-cols-2 gap-2">
              {REASONS.map((r) => {
                const Icon = r.icon;
                const isSelected = selectedReason === r.label;
                return (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setSelectedReason(r.label)}
                    aria-pressed={isSelected}
                    className={`flex items-center gap-2 p-2.5 min-h-[44px] rounded-xl border text-xs text-left transition cursor-pointer ${
                      isSelected
                        ? 'bg-info-bg border-info text-info font-semibold'
                        : 'bg-surface border-border text-ink-secondary hover:border-border-strong hover:text-ink'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-info-fill' : 'text-ink-muted'}`} />
                    <span>{r.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 min-h-[44px] rounded-xl bg-bg-secondary hover:bg-border text-ink-secondary hover:text-ink text-xs font-semibold transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleAction}
              disabled={exhausted}
              className={`flex-1 py-2.5 min-h-[44px] rounded-xl text-xs font-semibold shadow-card transition ${
                exhausted
                  ? 'bg-disabled-bg text-disabled cursor-not-allowed shadow-none'
                  : isGloballyFrozen
                  ? 'bg-error hover:brightness-110 text-white cursor-pointer'
                  : 'bg-info hover:brightness-110 text-white font-bold cursor-pointer'
              }`}
            >
              {isGloballyFrozen ? 'Deactivate Holiday Mode' : 'Activate Freeze Day'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
