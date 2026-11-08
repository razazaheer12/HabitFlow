import React, { useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { fromLocalDateString, shiftDate, toLocalDateString } from '../domain/date';
import { Habit, HabitLog, StreakFreeze } from '../types';
import { isHabitCompleted, isHabitFrozen } from '../domain/streak';
import { isHabitScheduledForDate } from '../domain/schedule';

interface DateCarouselProps {
  selectedDate: string;
  onSelectDate: (dateStr: string) => void;
  habits: Habit[];
  logs: HabitLog[];
  freezes: StreakFreeze[];
}

export const DateCarousel: React.FC<DateCarouselProps> = ({
  selectedDate,
  onSelectDate,
  habits,
  logs,
  freezes
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const todayStr = toLocalDateString();

  // Show past 14 days + today + next 1 day
  const dateList: string[] = [];
  for (let i = 14; i >= -1; i--) {
    dateList.push(shiftDate(todayStr, -i));
  }

  // Scroll active item into view
  useEffect(() => {
    if (!scrollRef.current) return;
    const activeEl = scrollRef.current.querySelector('[data-active="true"]');
    if (activeEl) {
      activeEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  }, [selectedDate]);

  const handlePrevDay = () => {
    onSelectDate(shiftDate(selectedDate, -1));
  };

  const handleNextDay = () => {
    onSelectDate(shiftDate(selectedDate, 1));
  };

  return (
    <div className="w-full flex items-center gap-2 select-none">
      <button
        onClick={handlePrevDay}
        aria-label="Previous day"
        className="w-10 h-10 rounded-xl bg-surface border border-border flex items-center justify-center text-ink-secondary hover:text-ink hover:border-border-strong transition shrink-0 cursor-pointer"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      <div
        ref={scrollRef}
        className="flex items-center gap-2 overflow-x-auto py-1 px-0.5 no-scrollbar scroll-smooth flex-1"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {dateList.map((dateStr) => {
          const d = fromLocalDateString(dateStr);
          const isSelected = dateStr === selectedDate;
          const isToday = dateStr === todayStr;

          const dayOfWeekLetter = d.toLocaleDateString(undefined, { weekday: 'narrow' });
          const dayNumber = d.getDate();

          // Calculate day completion status
          const dueHabits = habits.filter((h) => !h.archived && isHabitScheduledForDate(h, dateStr));
          const completedCount = dueHabits.filter((h) =>
            isHabitCompleted(h.id, dateStr, logs)
          ).length;
          const isFrozen = freezes.some(
            (f) => f.date === dateStr && (!f.habitId || dueHabits.every((h) => isHabitFrozen(h.id, dateStr, freezes)))
          );

          const isFullyDone = dueHabits.length > 0 && completedCount === dueHabits.length;
          const isPartiallyDone = completedCount > 0 && !isFullyDone;

          const accessibleLabel = `${d.toLocaleDateString(undefined, {
            weekday: 'short',
            month: 'short',
            day: 'numeric'
          })}${isFrozen ? ' - Streak Frozen' : isFullyDone ? ' - All Completed' : ''}`;

          return (
            <button
              key={dateStr}
              type="button"
              data-active={isSelected}
              onClick={() => onSelectDate(dateStr)}
              aria-label={accessibleLabel}
              aria-current={isSelected ? 'date' : undefined}
              className={`min-w-[48px] py-2 px-1.5 rounded-2xl flex flex-col items-center justify-center transition-all cursor-pointer relative shrink-0 border ${
                isSelected
                  ? 'bg-accent border-accent text-ink-on-accent shadow-card scale-105'
                  : isToday
                  ? 'bg-surface border-accent text-ink'
                  : 'bg-surface border-border text-ink-secondary hover:border-border-strong hover:text-ink'
              }`}
            >
              <span className={`text-xs uppercase tracking-wider ${isSelected ? 'text-ink-on-accent font-bold' : 'text-ink-muted'}`}>
                {dayOfWeekLetter}
              </span>
              <span className="text-sm font-bold tabular-nums leading-none mt-1">
                {dayNumber}
              </span>

              {/* Status Indicator Dot */}
              <div className="h-1.5 w-1.5 rounded-full mt-1.5 flex items-center justify-center">
                {isFrozen ? (
                  <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-ink-on-accent' : 'bg-info-fill'}`} />
                ) : isFullyDone ? (
                  <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-ink-on-accent' : 'bg-success-fill'}`} />
                ) : isPartiallyDone ? (
                  <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-ink-on-accent' : 'bg-warning-fill'}`} />
                ) : (
                  <span className="w-1 h-1 rounded-full opacity-0" />
                )}
              </div>
            </button>
          );
        })}
      </div>

      <button
        onClick={handleNextDay}
        aria-label="Next day"
        className="w-10 h-10 rounded-xl bg-surface border border-border flex items-center justify-center text-ink-secondary hover:text-ink hover:border-border-strong transition shrink-0 cursor-pointer"
      >
        <ChevronRight className="w-4 h-4" />
      </button>

      {selectedDate !== todayStr && (
        <button
          onClick={() => onSelectDate(todayStr)}
          className="text-xs font-semibold text-accent-text hover:text-ink-on-accent hover:bg-accent px-3 py-1.5 bg-accent-soft border border-accent-border rounded-lg whitespace-nowrap cursor-pointer transition shrink-0"
        >
          Today
        </button>
      )}
    </div>
  );
};
