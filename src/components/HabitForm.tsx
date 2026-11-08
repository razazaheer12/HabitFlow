import React, { useState, useEffect } from 'react';
import { Clock, Target } from 'lucide-react';
import { Habit, HabitCategory, CATEGORIES, ScheduleType } from '../types';

interface HabitFormProps {
  initialHabit?: Habit | null;
  /** Receives validated habit data. The caller decides persistence + navigation. */
  onSubmit: (habitData: Partial<Habit>) => void;
  onCancel: () => void;
  submitLabel?: string;
  autoFocus?: boolean;
}

const DAYS_OF_WEEK = [
  { label: 'Sun', value: 0 },
  { label: 'Mon', value: 1 },
  { label: 'Tue', value: 2 },
  { label: 'Wed', value: 3 },
  { label: 'Thu', value: 4 },
  { label: 'Fri', value: 5 },
  { label: 'Sat', value: 6 }
];

/* Pastel chip treatment for a selected category (Section 5.6). */
const CAT_SELECTED: Record<HabitCategory, string> = {
  fitness: 'bg-cat-fitness-bg text-cat-fitness-ink border-cat-fitness-border',
  mind: 'bg-cat-mind-bg text-cat-mind-ink border-cat-mind-border',
  productivity: 'bg-cat-productivity-bg text-cat-productivity-ink border-cat-productivity-border',
  learning: 'bg-cat-learning-bg text-cat-learning-ink border-cat-learning-border',
  health: 'bg-cat-health-bg text-cat-health-ink border-cat-health-border'
};

const INPUT_CLASS =
  'w-full px-4 py-2.5 rounded-xl bg-surface border border-border-strong text-ink placeholder-ink-muted focus:outline-none focus:border-forest focus:ring-2 focus:ring-forest/15 text-sm transition';

const SEGMENT_ACTIVE = 'bg-accent text-ink-on-accent shadow-card font-semibold';
const SEGMENT_IDLE = 'text-ink-secondary hover:text-ink';

/**
 * The single source of truth for habit create/edit fields and validation.
 * Rendered inside the quick-add dialog AND the dedicated /habits/new and
 * /habits/:id/edit pages so behaviour never diverges between surfaces.
 */
export const HabitForm: React.FC<HabitFormProps> = ({
  initialHabit,
  onSubmit,
  onCancel,
  submitLabel,
  autoFocus = true
}) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<HabitCategory>('productivity');
  const [scheduleType, setScheduleType] = useState<ScheduleType>('daily');
  const [selectedDays, setSelectedDays] = useState<number[]>([1, 2, 3, 4, 5]);
  const [targetCount, setTargetCount] = useState<number>(3);
  const [reminderTime, setReminderTime] = useState('');
  const [targetUnit, setTargetUnit] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialHabit) {
      setTitle(initialHabit.title);
      setCategory(initialHabit.category);
      setScheduleType(initialHabit.schedule?.type || 'daily');
      setSelectedDays(initialHabit.schedule?.days || [1, 2, 3, 4, 5]);
      setTargetCount(initialHabit.schedule?.targetCount || 3);
      setReminderTime(initialHabit.reminderTime || '');
      setTargetUnit(initialHabit.targetUnit || '');
      setNotes(initialHabit.notes || '');
    } else {
      setTitle('');
      setCategory('productivity');
      setScheduleType('daily');
      setSelectedDays([1, 2, 3, 4, 5]);
      setTargetCount(3);
      setReminderTime('');
      setTargetUnit('');
      setNotes('');
    }
    setError('');
  }, [initialHabit]);

  const toggleDay = (dayValue: number) => {
    setSelectedDays((prev) => {
      if (prev.includes(dayValue)) {
        if (prev.length <= 1) return prev; // keep at least 1 day
        return prev.filter((d) => d !== dayValue);
      }
      return [...prev, dayValue].sort();
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Please provide a title for your habit.');
      return;
    }

    onSubmit({
      id: initialHabit?.id,
      title: title.trim(),
      category,
      schedule: {
        type: scheduleType,
        days: scheduleType === 'specific_days' ? selectedDays : undefined,
        targetCount: scheduleType === 'times_per_week' ? targetCount : undefined
      },
      reminderTime: reminderTime.trim() || undefined,
      targetUnit: targetUnit.trim() || undefined,
      notes: notes.trim() || undefined
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div role="alert" className="p-3 text-xs rounded-xl bg-error-bg border border-error-border text-error font-medium">
          {error}
        </div>
      )}

      {/* Title */}
      <div className="space-y-1.5">
        <label htmlFor="habit-name-input" className="text-xs font-semibold text-ink-secondary block">
          Habit Name
        </label>
        <input
          id="habit-name-input"
          type="text"
          required
          autoFocus={autoFocus}
          placeholder="e.g. 10 Pages of Non-Fiction"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            if (error) setError('');
          }}
          className={INPUT_CLASS}
        />
      </div>

      {/* Category Selector */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-ink-secondary block">Category</label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {(Object.keys(CATEGORIES) as HabitCategory[]).map((catKey) => {
            const info = CATEGORIES[catKey];
            const isSelected = category === catKey;
            return (
              <button
                key={catKey}
                type="button"
                onClick={() => setCategory(catKey)}
                aria-pressed={isSelected}
                className={`flex items-center gap-2 p-2.5 min-h-[44px] rounded-xl border text-left transition cursor-pointer ${
                  isSelected
                    ? `${CAT_SELECTED[catKey]} font-semibold shadow-card`
                    : 'bg-surface border-border text-ink-secondary hover:border-border-strong hover:text-ink'
                }`}
              >
                <span className="text-sm font-medium">{info.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Scheduling Rules */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-ink-secondary block">Schedule Rule</label>
        <div className="flex rounded-xl bg-bg-secondary p-1 border border-border">
          <button
            type="button"
            onClick={() => setScheduleType('daily')}
            className={`flex-1 py-1.5 text-xs rounded-lg transition cursor-pointer ${
              scheduleType === 'daily' ? SEGMENT_ACTIVE : SEGMENT_IDLE
            }`}
          >
            Every Day
          </button>
          <button
            type="button"
            onClick={() => setScheduleType('specific_days')}
            className={`flex-1 py-1.5 text-xs rounded-lg transition cursor-pointer ${
              scheduleType === 'specific_days' ? SEGMENT_ACTIVE : SEGMENT_IDLE
            }`}
          >
            Selected Days
          </button>
          <button
            type="button"
            onClick={() => setScheduleType('times_per_week')}
            className={`flex-1 py-1.5 text-xs rounded-lg transition cursor-pointer ${
              scheduleType === 'times_per_week' ? SEGMENT_ACTIVE : SEGMENT_IDLE
            }`}
          >
            Weekly Target
          </button>
        </div>

        {scheduleType === 'specific_days' && (
          <div className="space-y-1.5 pt-1">
            <span className="text-xs text-ink-secondary block">
              Other days will be planned rest days (won't count as missed).
            </span>
            <div className="flex gap-1.5">
              {DAYS_OF_WEEK.map((d) => {
                const isChecked = selectedDays.includes(d.value);
                return (
                  <button
                    key={d.value}
                    type="button"
                    onClick={() => toggleDay(d.value)}
                    aria-pressed={isChecked}
                    className={`flex-1 py-2 rounded-full text-xs font-semibold transition cursor-pointer border ${
                      isChecked
                        ? 'bg-accent border-accent text-ink-on-accent shadow-card'
                        : 'bg-surface border-border-strong text-ink-secondary hover:text-ink hover:border-ink-muted'
                    }`}
                  >
                    {d.label}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {scheduleType === 'times_per_week' && (
          <div className="space-y-1.5 pt-1">
            <span className="text-xs text-ink-secondary block">
              Streak will calculate based on completing this target each week.
            </span>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="1"
                max="7"
                value={targetCount}
                onChange={(e) => setTargetCount(Number(e.target.value))}
                aria-label="Weekly target days"
                className="flex-1 accent-success-fill cursor-pointer"
              />
              <span className="text-sm font-bold text-accent-text tabular-nums min-w-[5rem] text-right">
                {targetCount} days/week
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Target & Reminder Time Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label htmlFor="target-unit-input" className="text-xs font-semibold text-ink-secondary flex items-center gap-1.5">
            <Target className="w-3.5 h-3.5 text-ink-muted" />
            Target Unit / Goal
          </label>
          <input
            id="target-unit-input"
            type="text"
            placeholder="e.g. 30 mins, 2 liters"
            value={targetUnit}
            onChange={(e) => setTargetUnit(e.target.value)}
            className={INPUT_CLASS}
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="reminder-time-input" className="text-xs font-semibold text-ink-secondary flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-ink-muted" />
            Reminder Time
          </label>
          <input
            id="reminder-time-input"
            type="time"
            value={reminderTime}
            onChange={(e) => setReminderTime(e.target.value)}
            className={INPUT_CLASS}
          />
        </div>
      </div>

      {/* Motivation / Notes */}
      <div className="space-y-1.5">
        <label htmlFor="habit-notes-input" className="text-xs font-semibold text-ink-secondary block">
          Motivation or Trigger <span className="text-ink-muted font-normal">(optional)</span>
        </label>
        <input
          id="habit-notes-input"
          type="text"
          placeholder="e.g. Immediately after morning coffee"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className={INPUT_CLASS}
        />
      </div>

      <div className="pt-2 flex items-center gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 py-3 min-h-[44px] rounded-xl bg-bg-secondary hover:bg-border text-ink-secondary hover:text-ink text-sm font-medium transition cursor-pointer"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="flex-1 py-3 min-h-[44px] rounded-xl bg-accent hover:bg-accent-hover text-ink-on-accent text-sm font-semibold shadow-card active:scale-[0.98] transition cursor-pointer"
        >
          {submitLabel ?? (initialHabit ? 'Save Changes' : 'Create Habit')}
        </button>
      </div>
    </form>
  );
};
