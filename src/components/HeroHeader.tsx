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
    <div className="w-full space-y-4">
      {/* Dynamic Greeting & Actions Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
            <span>{formatDisplayDate(selectedDate, { includeYear: true })}</span>
            <span aria-hidden="true">·</span>
            <span className="text-emerald-400 font-semibold">{isViewingToday ? 'Live Today' : 'Historical Log'}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
            {greeting}, <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">{userName || 'Friend'}</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">{subtext}</p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={onOpenFreezeModal}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border transition cursor-pointer ${
              isHolidayMode
                ? 'bg-sky-500/15 border-sky-500/40 text-sky-300'
                : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700 hover:text-white'
            }`}
            title="Streak Freeze & Holiday Protection"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-sky-400" />
            <span>{isHolidayMode ? 'Holiday Mode' : 'Streak Freeze'}</span>
          </button>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-3 gap-2.5 sm:gap-4">
        {/* Stat 1: Today's Completion Rate */}
        <div className="p-3 sm:p-4 rounded-2xl bg-slate-900/90 border border-slate-800/80 flex items-center justify-between">
          <div className="space-y-0.5 min-w-0">
            <span className="text-[11px] sm:text-xs font-medium text-slate-400 block truncate">Completion</span>
            <div className="text-lg sm:text-2xl font-bold font-mono text-white tabular-nums">
              {completionRate}%
            </div>
            <span className="text-[11px] text-slate-500 hidden sm:block">
              {completedTodayCount} of {dueTodayCount} due
            </span>
          </div>

          <div className="relative w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center shrink-0">
            <svg className="w-10 h-10 sm:w-12 sm:h-12 -rotate-90" viewBox="0 0 60 60">
              <circle
                cx="30"
                cy="30"
                r={radius}
                className="stroke-slate-800"
                strokeWidth="4.5"
                fill="none"
              />
              <circle
                cx="30"
                cy="30"
                r={radius}
                className="stroke-emerald-400 transition-all duration-500 ease-out"
                strokeWidth="4.5"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="none"
              />
            </svg>
            <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400 absolute" />
          </div>
        </div>

        {/* Stat 2: Current Streak */}
        <div className="p-3 sm:p-4 rounded-2xl bg-slate-900/90 border border-slate-800/80 flex items-center justify-between">
          <div className="space-y-0.5 min-w-0">
            <span className="text-[11px] sm:text-xs font-medium text-slate-400 block truncate">Streak</span>
            <div className="text-lg sm:text-2xl font-bold font-mono text-white tabular-nums flex items-center gap-1">
              <span>{currentStreak}</span>
              <span className="text-xs font-normal text-slate-500">d</span>
            </div>
            <span className="text-[11px] text-amber-400/90 font-medium hidden sm:block truncate">
              {currentStreak > 0 ? 'Active streak' : 'Ready'}
            </span>
          </div>

          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
            <Flame className="w-4 h-4 sm:w-5 sm:h-5 fill-amber-400/20" />
          </div>
        </div>

        {/* Stat 3: Active Habits */}
        <div className="p-3 sm:p-4 rounded-2xl bg-slate-900/90 border border-slate-800/80 flex items-center justify-between">
          <div className="space-y-0.5 min-w-0">
            <span className="text-[11px] sm:text-xs font-medium text-slate-400 block truncate">Habits</span>
            <div className="text-lg sm:text-2xl font-bold font-mono text-white tabular-nums">
              {activeHabitsCount}
            </div>
            <span className="text-[11px] text-slate-500 hidden sm:block truncate">Active routine</span>
          </div>

          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 shrink-0">
            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
        </div>
      </div>
    </div>
  );
};
