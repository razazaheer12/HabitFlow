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
    <div className="relative overflow-hidden p-8 sm:p-12 rounded-[20px] bg-surface border border-border shadow-card text-center">
      <div className="relative z-10 max-w-md mx-auto space-y-5">
        <div className="w-14 h-14 rounded-2xl bg-accent-soft border border-accent-border flex items-center justify-center mx-auto">
          <Sparkles className="w-6 h-6 text-accent-text" />
        </div>

        <div className="space-y-2">
          <h2 className="text-xl sm:text-2xl font-bold text-ink tracking-tight">
            {userName ? `${userName}, your journey starts here` : 'Your journey starts here'}
          </h2>
          <p className="text-sm text-ink-secondary leading-relaxed">
            Small daily wins compound into lasting change. Create your first habit and it will
            appear here every day it's scheduled — ready for a single-tap check-off.
          </p>
        </div>

        <button
          type="button"
          onClick={onCreateFirstHabit}
          className="inline-flex items-center gap-2 px-6 py-3 min-h-[44px] rounded-xl bg-accent hover:bg-accent-hover active:scale-[0.98] text-ink-on-accent text-sm font-bold shadow-card transition cursor-pointer"
        >
          <Plus className="w-4 h-4" strokeWidth={2.5} />
          <span>Create Your First Habit</span>
        </button>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-4 text-left">
          <div className="p-3 rounded-2xl bg-bg-secondary border border-border">
            <CheckCircle2 className="w-4 h-4 text-success-fill mb-1.5" />
            <p className="text-xs font-semibold text-ink">Check off daily</p>
            <p className="text-xs text-ink-secondary leading-relaxed mt-0.5">One tap per habit. Back-date misses from the calendar strip.</p>
          </div>
          <div className="p-3 rounded-2xl bg-bg-secondary border border-border">
            <Flame className="w-4 h-4 text-warning-fill mb-1.5" />
            <p className="text-xs font-semibold text-ink">Build streaks</p>
            <p className="text-xs text-ink-secondary leading-relaxed mt-0.5">Consecutive wins grow your streak and fill the heatmap.</p>
          </div>
          <div className="p-3 rounded-2xl bg-bg-secondary border border-border">
            <ShieldAlert className="w-4 h-4 text-info-fill mb-1.5" />
            <p className="text-xs font-semibold text-ink">Stay protected</p>
            <p className="text-xs text-ink-secondary leading-relaxed mt-0.5">Sick or traveling? Freeze the day — streaks survive life.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
