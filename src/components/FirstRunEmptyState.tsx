import React from 'react';
import { Sparkles, Plus, CheckCircle2, Flame, ShieldAlert } from 'lucide-react';

interface FirstRunEmptyStateProps {
  userName: string;
  onCreateFirstHabit: () => void;
}

export const FirstRunEmptyState: React.FC<FirstRunEmptyStateProps> = ({
  userName,
  onCreateFirstHabit
}) => {
  return (
    <div className="relative overflow-hidden p-8 sm:p-12 rounded-3xl bg-slate-900/60 border border-slate-800/80 text-center">
      <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-72 h-72 bg-emerald-500/[0.07] rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-md mx-auto space-y-5">
        <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto">
          <Sparkles className="w-6 h-6 text-emerald-400" />
        </div>

        <div className="space-y-2">
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            {userName ? `${userName}, your journey starts here` : 'Your journey starts here'}
          </h2>
          <p className="text-sm text-slate-400 leading-relaxed">
            Small daily wins compound into lasting change. Create your first habit and it will
            appear here every day it's scheduled — ready for a single-tap check-off.
          </p>
        </div>

        <button
          type="button"
          onClick={onCreateFirstHabit}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-slate-950 text-sm font-bold shadow-lg shadow-emerald-500/20 transition cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Create Your First Habit</span>
        </button>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-4 text-left">
          <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800/80">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 mb-1.5" />
            <p className="text-xs font-semibold text-slate-200">Check off daily</p>
            <p className="text-xs text-slate-500 leading-relaxed mt-0.5">One tap per habit. Back-date misses from the calendar strip.</p>
          </div>
          <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800/80">
            <Flame className="w-4 h-4 text-amber-400 mb-1.5" />
            <p className="text-xs font-semibold text-slate-200">Build streaks</p>
            <p className="text-xs text-slate-500 leading-relaxed mt-0.5">Consecutive wins grow your streak and fill the heatmap.</p>
          </div>
          <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800/80">
            <ShieldAlert className="w-4 h-4 text-sky-400 mb-1.5" />
            <p className="text-xs font-semibold text-slate-200">Stay protected</p>
            <p className="text-xs text-slate-500 leading-relaxed mt-0.5">Sick or traveling? Freeze the day — streaks survive life.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
