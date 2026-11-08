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
        <div role="alert" className="p-3 text-xs rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300">
          {error}
        </div>
      )}

      {/* Title */}
      <div className="space-y-1.5">
        <label htmlFor="habit-name-input" className="text-xs font-semibold text-slate-300 block">
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
          className="w-full px-4 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700/80 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 text-sm transition"
        />
      </div>

      {/* Category Selector */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-slate-300 block">Category</label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {(Object.keys(CATEGORIES) as HabitCategory[]).map((catKey) => {
            const info = CATEGORIES[catKey];
            const isSelected = category === catKey;
            return (
              <button
                key={catKey}
                type="button"
                onClick={() => setCategory(catKey)}
                className={`flex items-center gap-2 p-2.5 rounded-xl border text-left transition cursor-pointer ${
                  isSelected
                    ? 'bg-slate-800 border-emerald-500 text-white shadow-sm'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
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
        <label className="text-xs font-semibold text-slate-300 block">Schedule Rule</label>
        <div className="flex rounded-xl bg-slate-800/80 p-1 border border-slate-700/60">
          <button
            type="button"
            onClick={() => setScheduleType('daily')}
            className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition cursor-pointer ${
              scheduleType === 'daily'
                ? 'bg-emerald-500 text-slate-950 shadow-sm font-semibold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Every Day
          </button>
          <button
            type="button"
            onClick={() => setScheduleType('specific_days')}
            className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition cursor-pointer ${
              scheduleType === 'specific_days'
                ? 'bg-emerald-500 text-slate-950 shadow-sm font-semibold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Selected Days
          </button>
          <button
            type="button"
            onClick={() => setScheduleType('times_per_week')}
            className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition cursor-pointer ${
              scheduleType === 'times_per_week'
                ? 'bg-emerald-500 text-slate-950 shadow-sm font-semibold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Weekly Target
          </button>
        </div>

        {scheduleType === 'specific_days' && (
          <div className="space-y-1.5 pt-1">
            <span className="text-[11px] text-slate-400 block">
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
                    className={`flex-1 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
                      isChecked
                        ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-300'
                        : 'bg-slate-800/60 border border-slate-700 text-slate-400 hover:text-slate-200'
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
            <span className="text-[11px] text-slate-400 block">
              Streak will calculate based on completing this target each week.
            </span>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="1"
                max="7"
                value={targetCount}
                onChange={(e) => setTargetCount(Number(e.target.value))}
                className="flex-1 accent-emerald-500 cursor-pointer"
              />
              <span className="text-sm font-mono font-bold text-emerald-400 min-w-[5rem] text-right">
                {targetCount} days/week
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Target & Reminder Time Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label htmlFor="target-unit-input" className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
            <Target className="w-3.5 h-3.5 text-slate-400" />
            Target Unit / Goal
          </label>
          <input
            id="target-unit-input"
            type="text"
            placeholder="e.g. 30 mins, 2 liters"
            value={targetUnit}
            onChange={(e) => setTargetUnit(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700/80 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 text-sm transition"
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="reminder-time-input" className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            Reminder Time
          </label>
          <input
            id="reminder-time-input"
            type="time"
            value={reminderTime}
            onChange={(e) => setReminderTime(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700/80 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 text-sm font-mono transition"
          />
        </div>
      </div>

      {/* Motivation / Notes */}
      <div className="space-y-1.5">
        <label htmlFor="habit-notes-input" className="text-xs font-semibold text-slate-300 block">
          Motivation or Trigger <span className="text-slate-500 font-normal">(optional)</span>
        </label>
        <input
          id="habit-notes-input"
          type="text"
          placeholder="e.g. Immediately after morning coffee"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="w-full px-4 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700/80 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 text-sm transition"
        />
      </div>

      <div className="pt-2 flex items-center gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 py-3 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 text-sm font-medium transition cursor-pointer"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="flex-1 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-sm font-semibold shadow-lg shadow-emerald-500/20 active:scale-95 transition cursor-pointer"
        >
          {submitLabel ?? (initialHabit ? 'Save Changes' : 'Create Habit')}
        </button>
      </div>
    </form>
  );
};
