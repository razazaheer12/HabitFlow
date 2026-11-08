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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="freeze-modal-title"
        className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl relative animate-in fade-in zoom-in-95"
      >
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <h3 id="freeze-modal-title" className="text-base font-bold text-white tracking-tight">Streak Freeze & Protection</h3>
              <p className="text-xs text-slate-400">{formatDisplayDate(selectedDate)}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close"
            className="w-8 h-8 rounded-xl bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-4">
          {/* Explanation Banner */}
          <div className="p-3.5 rounded-2xl bg-sky-500/10 border border-sky-500/20 text-xs text-sky-200 leading-relaxed">
            <span className="font-semibold block mb-0.5">How Streak Freeze Works:</span>
            Life happens! Freezing protects your hard-earned streak on sick or travel days. Your continuous streak score won't reset to zero.
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
            <span className="text-xs text-slate-300 font-medium">Monthly Freeze Allowance</span>
            <span
              className={`text-xs font-mono font-bold ${
                remainingAllowance <= 0 ? 'text-rose-400' : 'text-sky-400'
              }`}
            >
              {remainingAllowance <= 0 ? 'No freezes left' : `${remainingAllowance} available`}
            </span>
          </div>

          {exhausted && (
            <div
              role="alert"
              className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-200 leading-relaxed"
            >
              You've used every freeze token for this month. Your allowance resets on the 1st.
              Existing freezes can still be deactivated.
            </div>
          )}

          {/* Current Status */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-slate-300 block">Select Reason</label>
            <div className="grid grid-cols-2 gap-2">
              {REASONS.map((r) => {
                const Icon = r.icon;
                const isSelected = selectedReason === r.label;
                return (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setSelectedReason(r.label)}
                    className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs text-left transition cursor-pointer ${
                      isSelected
                        ? 'bg-sky-500/15 border-sky-500 text-white font-medium'
                        : 'bg-slate-800/50 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5 text-sky-400 shrink-0" />
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
              className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleAction}
              disabled={exhausted}
              className={`flex-1 py-2.5 rounded-xl text-xs font-semibold shadow-md transition ${
                exhausted
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed shadow-none'
                  : isGloballyFrozen
                  ? 'bg-rose-500 hover:bg-rose-400 text-white shadow-rose-500/20 cursor-pointer'
                  : 'bg-sky-500 hover:bg-sky-400 text-slate-950 shadow-sky-500/20 font-bold cursor-pointer'
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
