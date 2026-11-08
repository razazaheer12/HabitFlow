import React, { useState } from 'react';
import { Calendar, BarChart3, TrendingUp, TrendingDown, Minus, Award } from 'lucide-react';
import { Habit, HabitLog, StreakFreeze, HeatmapDay, CATEGORIES } from '../types';
import {
  calculatePercentageHeatmap,
  calculateCategoryBreakdown,
  calculateWeekOverWeekComparison,
  calculateMonthOverMonthComparison,
  calculateOverallCompletionRate,
  getBestPerformingCategory
} from '../domain/analytics';
import { formatDisplayDate } from '../domain/date';

interface HeatmapAnalyticsProps {
  habits: Habit[];
  logs: HabitLog[];
  freezes: StreakFreeze[];
  onSelectDate?: (dateStr: string) => void;
}

export const HeatmapAnalytics: React.FC<HeatmapAnalyticsProps> = ({
  habits,
  logs,
  freezes,
  onSelectDate
}) => {
  const [rangeMode, setRangeMode] = useState<'3m' | '6m' | '1y'>('3m');
  const [categoryDays, setCategoryDays] = useState<7 | 30>(30);
  const [hoveredDay, setHoveredDay] = useState<HeatmapDay | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null);

  const daysCount = rangeMode === '3m' ? 84 : rangeMode === '6m' ? 168 : 364; // multiple of 7
  const heatmapData = calculatePercentageHeatmap(habits, logs, freezes, daysCount);
  const categoryBreakdown = calculateCategoryBreakdown(habits, logs, freezes, categoryDays);
  const bestCategory = getBestPerformingCategory(categoryBreakdown);

  // Period comparisons
  const wowComparison = calculateWeekOverWeekComparison(habits, logs, freezes);
  const momComparison = calculateMonthOverMonthComparison(habits, logs, freezes);

  // Group into columns of 7 days (weeks)
  const weeks: HeatmapDay[][] = [];
  for (let i = 0; i < heatmapData.length; i += 7) {
    weeks.push(heatmapData.slice(i, i + 7));
  }

  // Weighted OVERALL completion rate across every active habit for the SAME
  // trailing window as the category breakdown (total completed eligible
  // check-ins / total eligible scheduled check-ins). This replaces the old
  // "active days / calendar days" figure, which was a different metric entirely
  // and produced the misleading 1% Overall next to 50% category rates.
  const overall = calculateOverallCompletionRate(habits, logs, freezes, categoryDays);

  const getCellColor = (day: HeatmapDay) => {
    if (day.isFrozen) {
      return 'bg-sky-500/50 hover:bg-sky-400 border border-sky-400/40';
    }
    switch (day.intensity) {
      case 4:
        return 'bg-emerald-400 hover:bg-emerald-300 shadow-sm shadow-emerald-400/20';
      case 3:
        return 'bg-emerald-600 hover:bg-emerald-500';
      case 2:
        return 'bg-emerald-800 hover:bg-emerald-700';
      case 1:
        return 'bg-emerald-950/80 border border-emerald-800/40 hover:bg-emerald-900';
      default:
        return 'bg-slate-850 hover:bg-slate-800 border border-slate-800/60';
    }
  };

  const handleMouseEnter = (day: HeatmapDay, e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setHoveredDay(day);
    setTooltipPos({ x: rect.left + rect.width / 2, y: rect.top - 8 });
  };

  if (habits.length === 0) {
    return (
      <div className="w-full">
        <div className="p-10 text-center rounded-3xl bg-slate-900/60 border border-slate-800/80 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center text-slate-500 mx-auto">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-white">No analytics yet</h2>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto leading-relaxed">
              Your consistency heatmap, category breakdown, and week-over-week trends appear here
              once you create a habit and start logging completions.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      {/* Heatmap Section */}
      <div className="p-4 sm:p-6 rounded-3xl bg-slate-900/90 border border-slate-800/80 shadow-sm relative">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">Consistency Heatmap</h2>
              <p className="text-xs text-slate-400">Completion density percentage per eligible scheduled day</p>
            </div>
          </div>

          {/* Range Selector */}
          <div className="flex items-center gap-1 p-1 bg-slate-800/80 rounded-xl border border-slate-700/60 self-start sm:self-auto">
            <button
              onClick={() => setRangeMode('3m')}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition cursor-pointer ${
                rangeMode === '3m' ? 'bg-emerald-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              3 Months
            </button>
            <button
              onClick={() => setRangeMode('6m')}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition cursor-pointer ${
                rangeMode === '6m' ? 'bg-emerald-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              6 Months
            </button>
            <button
              onClick={() => setRangeMode('1y')}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition cursor-pointer ${
                rangeMode === '1y' ? 'bg-emerald-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              Full Year
            </button>
          </div>
        </div>

        {/* Heatmap Grid Container */}
        <div className="overflow-x-auto pb-2 scrollbar-thin">
          <div className="inline-flex flex-col gap-1.5 min-w-full">
            <div className="flex gap-1.5">
              {weeks.map((week, weekIdx) => (
                <div key={weekIdx} className="flex flex-col gap-1.5">
                  {week.map((day) => (
                    <button
                      key={day.date}
                      type="button"
                      onClick={() => onSelectDate && onSelectDate(day.date)}
                      onMouseEnter={(e) => handleMouseEnter(day, e)}
                      onMouseLeave={() => setHoveredDay(null)}
                      aria-label={`${day.date}: ${day.completedCount} of ${day.eligibleCount} eligible scheduled check-ins completed (${day.percentage}%)`}
                      className={`w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-[4px] transition-transform hover:scale-125 focus:scale-125 focus:outline-none cursor-pointer ${getCellColor(
                        day
                      )}`}
                    />
                  ))}
                </div>
              ))}
            </div>

            {/* Heatmap Legend */}
            <div className="flex items-center justify-between text-[11px] text-slate-400 pt-3 border-t border-slate-800/80 mt-2">
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-[3px] bg-sky-500/50 border border-sky-400/40 inline-block" />
                  <span>Frozen</span>
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <span>0%</span>
                <span className="w-3 h-3 rounded-[3px] bg-slate-800 border border-slate-700 inline-block" title="0%" />
                <span className="w-3 h-3 rounded-[3px] bg-emerald-950 border border-emerald-800/40 inline-block" title="1-39%" />
                <span className="w-3 h-3 rounded-[3px] bg-emerald-800 inline-block" title="40-74%" />
                <span className="w-3 h-3 rounded-[3px] bg-emerald-600 inline-block" title="75-99%" />
                <span className="w-3 h-3 rounded-[3px] bg-emerald-400 inline-block" title="100%" />
                <span>100%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Period Comparisons (WoW & MoM) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-slate-800/80">
          {/* Week over Week Card */}
          <div className="p-3.5 rounded-2xl bg-slate-850 border border-slate-800 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-[11px] font-semibold text-slate-400 block">{wowComparison.currentPeriodLabel}</span>
              <div className="flex items-baseline gap-2">
                <span className="text-sm font-bold text-white font-mono">
                  {wowComparison.currentHasData ? `${wowComparison.currentRate}%` : '—'}
                </span>
                <span className="text-[11px] text-slate-500 font-mono">
                  prev {wowComparison.previousHasData ? `${wowComparison.previousRate}%` : '—'}
                </span>
              </div>
              <span className="text-[11px] text-slate-500">
                {wowComparison.currentCompleted} of {wowComparison.currentScheduled} scheduled check-ins
              </span>
            </div>
            <div
              title="Change in percentage points vs the equivalent days of last week (pp = percentage points, not a relative percent change)"
              aria-label={`Week over week change: ${wowComparison.rateDelta} percentage points`}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-mono font-bold ${
                !wowComparison.comparable
                  ? 'bg-slate-800 text-slate-500 border border-slate-700'
                  : wowComparison.rateDelta > 0
                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                  : wowComparison.rateDelta < 0
                  ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                  : 'bg-slate-800 text-slate-400 border border-slate-700'
              }`}
            >
              {!wowComparison.comparable ? (
                <Minus className="w-3.5 h-3.5" />
              ) : wowComparison.rateDelta > 0 ? (
                <TrendingUp className="w-3.5 h-3.5 stroke-[2.5]" />
              ) : wowComparison.rateDelta < 0 ? (
                <TrendingDown className="w-3.5 h-3.5 stroke-[2.5]" />
              ) : (
                <Minus className="w-3.5 h-3.5" />
              )}
              <span>{wowComparison.comparable ? `${wowComparison.rateDelta > 0 ? '+' : ''}${wowComparison.rateDelta} pp` : 'No data'}</span>
            </div>
          </div>

          {/* Month over Month Card */}
          <div className="p-3.5 rounded-2xl bg-slate-850 border border-slate-800 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-[11px] font-semibold text-slate-400 block">{momComparison.currentPeriodLabel}</span>
              <div className="flex items-baseline gap-2">
                <span className="text-sm font-bold text-white font-mono">
                  {momComparison.currentHasData ? `${momComparison.currentRate}%` : '—'}
                </span>
                <span className="text-[11px] text-slate-500 font-mono">
                  prev {momComparison.previousHasData ? `${momComparison.previousRate}%` : '—'}
                </span>
              </div>
              <span className="text-[11px] text-slate-500">
                {momComparison.currentCompleted} of {momComparison.currentScheduled} scheduled check-ins
              </span>
            </div>
            <div
              title="Change in percentage points vs the equivalent days of last month (pp = percentage points, not a relative percent change)"
              aria-label={`Month over month change: ${momComparison.rateDelta} percentage points`}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-mono font-bold ${
                !momComparison.comparable
                  ? 'bg-slate-800 text-slate-500 border border-slate-700'
                  : momComparison.rateDelta > 0
                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                  : momComparison.rateDelta < 0
                  ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                  : 'bg-slate-800 text-slate-400 border border-slate-700'
              }`}
            >
              {!momComparison.comparable ? (
                <Minus className="w-3.5 h-3.5" />
              ) : momComparison.rateDelta > 0 ? (
                <TrendingUp className="w-3.5 h-3.5 stroke-[2.5]" />
              ) : momComparison.rateDelta < 0 ? (
                <TrendingDown className="w-3.5 h-3.5 stroke-[2.5]" />
              ) : (
                <Minus className="w-3.5 h-3.5" />
              )}
              <span>{momComparison.comparable ? `${momComparison.rateDelta > 0 ? '+' : ''}${momComparison.rateDelta} pp` : 'No data'}</span>
            </div>
          </div>
        </div>

        {/* Floating Tooltip */}
        {hoveredDay && tooltipPos && (
          <div
            className="fixed z-50 pointer-events-none transform -translate-x-1/2 -translate-y-full px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-xs shadow-2xl text-white font-medium text-center"
            style={{ left: `${tooltipPos.x}px`, top: `${tooltipPos.y}px` }}
          >
            <div className="font-semibold text-slate-200">
              {formatDisplayDate(hoveredDay.date, { includeYear: true })}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              {hoveredDay.isFrozen ? (
                <span className="text-sky-300">Streak Frozen (Holiday Mode)</span>
              ) : hoveredDay.eligibleCount === 0 ? (
                <span className="text-slate-400">Planned Rest Day</span>
              ) : (
                <span>
                  {hoveredDay.completedCount} of {hoveredDay.eligibleCount} completed ({hoveredDay.percentage}%)
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Category Progress Analytics */}
      <div className="p-4 sm:p-6 rounded-3xl bg-slate-900/90 border border-slate-800/80 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
              <BarChart3 className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-tight">Category Breakdown</h2>
                {bestCategory && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[11px] font-semibold">
                    <Award className="w-3 h-3" />
                    <span>Best: {CATEGORIES[bestCategory.category].name}</span>
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400">Completion consistency by habit category</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* 7d vs 30d toggle */}
            <div className="flex items-center gap-1 p-1 bg-slate-800/80 rounded-xl border border-slate-700/60">
              <button
                type="button"
                onClick={() => setCategoryDays(7)}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition cursor-pointer ${
                  categoryDays === 7 ? 'bg-sky-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                7 Days
              </button>
              <button
                type="button"
                onClick={() => setCategoryDays(30)}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition cursor-pointer ${
                  categoryDays === 30 ? 'bg-sky-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                30 Days
              </button>
            </div>

            <div className="text-right pl-2 border-l border-slate-800" title="Weighted overall completion rate across all active habits for the selected window">
              <span className="text-xs font-mono font-bold text-emerald-400 block">
                {overall.hasData ? `${overall.rate}%` : '—'}
              </span>
              <span className="text-[11px] text-slate-500">Overall</span>
            </div>
          </div>
        </div>

        <div className="space-y-3 pt-2">
          {categoryBreakdown.map((item) => {
            const cat = CATEGORIES[item.category];

            return (
              <div key={item.category} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                    <span className={cat.color}>●</span>
                    <span>{cat.name}</span>
                    <span className="text-slate-500 font-normal">({item.activeCount} habits)</span>
                  </span>
                  <span className="font-mono font-bold text-slate-300 tabular-nums">
                    {item.scheduledCount > 0 ? `${item.completionRate}%` : <span className="text-slate-500 font-sans font-medium">No data</span>}
                  </span>
                </div>

                <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ease-out ${
                      item.completionRate >= 80
                        ? 'bg-emerald-400'
                        : item.completionRate >= 50
                        ? 'bg-emerald-500'
                        : item.completionRate >= 20
                        ? 'bg-amber-400'
                        : 'bg-slate-600'
                    }`}
                    style={{ width: `${item.scheduledCount > 0 ? Math.max(item.completionRate, 3) : 0}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
