import React from 'react';
import { Flame, ShieldAlert, Sparkles, CheckCircle2 } from 'lucide-react';
import { getGreeting, formatDisplayDate, toLocalDateString } from '../domain/date';

interface HeroHeaderProps {
  userName: string;
  selectedDate: string;
  completionRate: number;
  currentStreak: number;
  activeHabitsCount: number;
  dueTodayCount: number;
  completedTodayCount: number;
  isHolidayMode: boolean;
  onOpenFreezeModal: () => void;
}

export const HeroHeader: React.FC<HeroHeaderProps> = ({
  userName,
  selectedDate,
  completionRate,
  currentStreak,
  activeHabitsCount,
  dueTodayCount,
  completedTodayCount,
  isHolidayMode,
  onOpenFreezeModal
}) => {
  const { greeting, subtext } = getGreeting();
  const todayStr = toLocalDateString();
  const isViewingToday = selectedDate === todayStr;

  // Circular progress calculations for the SVG ring
  const radius = 24;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (completionRate / 100) * circumference;

  return (
    <div className="w-full space-y-5">
      {/* Dynamic Greeting & Actions Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.08em] text-ink-muted">
            <span className="truncate">{formatDisplayDate(selectedDate, { includeYear: true })}</span>
            <span aria-hidden="true">·</span>
            <span className={isViewingToday ? 'text-accent-text' : 'text-ink-muted'}>
              {isViewingToday ? 'Live Today' : 'Historical Log'}
            </span>
          </div>
          <h1 className="text-[28px] leading-9 sm:text-[32px] sm:leading-10 font-extrabold tracking-[-0.02em] text-ink mt-1.5">
            {greeting}, {userName || 'Friend'}
          </h1>
          <p className="text-sm text-ink-secondary mt-1">{subtext}</p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={onOpenFreezeModal}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border transition cursor-pointer min-h-[44px] ${
              isHolidayMode
                ? 'bg-info-bg border-info-border text-info hover:border-info-fill'
                : 'bg-surface border-border text-ink-secondary hover:border-border-strong hover:text-ink'
            }`}
            title="Streak Freeze & Holiday Protection"
          >
            <ShieldAlert className={`w-4 h-4 ${isHolidayMode ? 'text-info-fill' : 'text-ink-muted'}`} />
            <span>{isHolidayMode ? 'Holiday Mode' : 'Streak Freeze'}</span>
          </button>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-3 gap-2.5 sm:gap-4">
        {/* Stat 1: Today's Completion Rate */}
        <div className="p-3 sm:p-4 rounded-2xl bg-surface border border-border shadow-card flex items-center justify-between">
          <div className="space-y-0.5 min-w-0">
            <span className="text-xs font-medium text-ink-secondary block truncate">Completion</span>
            <div className="text-xl sm:text-[28px] sm:leading-9 font-extrabold text-ink tabular-nums">
              {completionRate}%
            </div>
            <span className="text-xs text-ink-muted hidden sm:block">
              {completedTodayCount} of {dueTodayCount} due
            </span>
          </div>

          <div className="relative w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center shrink-0">
            <svg className="w-10 h-10 sm:w-12 sm:h-12 -rotate-90" viewBox="0 0 60 60">
              <circle
                cx="30"
                cy="30"
                r={radius}
                className="stroke-bg-secondary"
                strokeWidth="5"
                fill="none"
              />
              <circle
                cx="30"
                cy="30"
                r={radius}
                className="stroke-success-fill transition-all duration-500 ease-out"
                strokeWidth="5"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="none"
              />
            </svg>
            <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-success-fill absolute" />
          </div>
        </div>

        {/* Stat 2: Current Streak */}
        <div className="p-3 sm:p-4 rounded-2xl bg-surface border border-border shadow-card flex items-center justify-between">
          <div className="space-y-0.5 min-w-0">
            <span className="text-xs font-medium text-ink-secondary block truncate">Streak</span>
            <div className="text-xl sm:text-[28px] sm:leading-9 font-extrabold text-ink tabular-nums flex items-baseline gap-1">
              <span>{currentStreak}</span>
              <span className="text-xs font-medium text-ink-muted">d</span>
            </div>
            <span className="text-xs text-warning font-medium hidden sm:block truncate">
              {currentStreak > 0 ? 'Active streak' : 'Ready'}
            </span>
          </div>

          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-warning-bg border border-warning-border flex items-center justify-center text-warning-fill shrink-0">
            <Flame className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
        </div>

        {/* Stat 3: Active Habits */}
        <div className="p-3 sm:p-4 rounded-2xl bg-surface border border-border shadow-card flex items-center justify-between">
          <div className="space-y-0.5 min-w-0">
            <span className="text-xs font-medium text-ink-secondary block truncate">Habits</span>
            <div className="text-xl sm:text-[28px] sm:leading-9 font-extrabold text-ink tabular-nums">
              {activeHabitsCount}
            </div>
            <span className="text-xs text-ink-muted hidden sm:block truncate">Active routine</span>
          </div>

          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-accent-soft border border-accent-border flex items-center justify-center text-accent-text shrink-0">
            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
        </div>
      </div>
    </div>
  );
};
