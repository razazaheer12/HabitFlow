import { Habit, HabitLog, ScheduleHistoryEntry } from '../types';
import { fromLocalDateString, getCalendarWeekDates } from './date';

/**
 * Resolves the effective schedule for a habit on a specific date,
 * taking into account historical schedule revisions.
 *
 * Contract: `scheduleHistory` contains only PAST schedules, each tagged with
 * the date it became effective. The habit's current `schedule` is effective
 * from `scheduleEffectiveFrom` (defaults to the creation date). Dates are
 * always resolved against the schedule that was actually active on that day,
 * so later frequency edits can never rewrite past analytics.
 */
export function resolveScheduleForDate(habit: Habit, dateStr: string): Habit['schedule'] {
  const createdDate = habit.createdAt ? habit.createdAt.slice(0, 10) : '2000-01-01';
  const history = habit.scheduleHistory || [];

  // The current schedule takes effect from `scheduleEffectiveFrom`. For legacy
  // habits recorded before that field existed, fall back to the latest known
  // revision date (or creation date) so the current schedule never overwrites
  // a documented past range.
  const latestRevisionFrom = history.reduce(
    (max, r) => (r.effectiveFrom > max ? r.effectiveFrom : max),
    createdDate
  );
  const currentEffectiveFrom = habit.scheduleEffectiveFrom || latestRevisionFrom;

  const allRevisions: ScheduleHistoryEntry[] = [
    ...history,
    { effectiveFrom: currentEffectiveFrom, schedule: habit.schedule || { type: 'daily' } }
  ].sort((a, b) => a.effectiveFrom.localeCompare(b.effectiveFrom));

  const validRevisions = allRevisions.filter((r) => r.effectiveFrom <= dateStr);
  if (validRevisions.length > 0) {
    return validRevisions[validRevisions.length - 1].schedule;
  }

  return allRevisions[0].schedule;
}

/**
 * Checks whether a habit is scheduled for a given calendar date
 */
export function isHabitScheduledForDate(habit: Habit, dateStr: string): boolean {
  // If habit was created after this date, it wasn't scheduled yet
  const createdDate = habit.createdAt ? habit.createdAt.slice(0, 10) : '2000-01-01';
  if (dateStr < createdDate) {
    return false;
  }

  // If habit is archived, check if archived date was before this date
  if (habit.archived && habit.archivedAt) {
    const archivedDate = habit.archivedAt.slice(0, 10);
    if (dateStr > archivedDate) {
      return false;
    }
  }

  const schedule = resolveScheduleForDate(habit, dateStr);
  if (!schedule || schedule.type === 'daily') {
    return true;
  }

  if (schedule.type === 'specific_days') {
    const date = fromLocalDateString(dateStr);
    const dayOfWeek = date.getDay(); // 0 = Sun, 1 = Mon ... 6 = Sat
    const allowed = schedule.days || [1, 2, 3, 4, 5];
    return allowed.includes(dayOfWeek);
  }

  if (schedule.type === 'times_per_week') {
    // Habits with weekly target are eligible on any day of the week
    return true;
  }

  return true;
}

/**
 * Checks if a specific date is a planned rest day for this habit
 */
export function isPlannedRestDay(habit: Habit, dateStr: string): boolean {
  const schedule = resolveScheduleForDate(habit, dateStr);
  if (schedule.type === 'specific_days') {
    const date = fromLocalDateString(dateStr);
    const dayOfWeek = date.getDay();
    const allowed = schedule.days || [1, 2, 3, 4, 5];
    return !allowed.includes(dayOfWeek);
  }

  return false;
}

/**
 * Determines whether this habit instance is eligible in rate denominator
 * Rule: Exclude planned rest days and valid excused/frozen days from denominator.
 */
export function isEligibleInstance(
  habit: Habit,
  dateStr: string,
  isFrozen: boolean
): boolean {
  if (!isHabitScheduledForDate(habit, dateStr)) {
    return false;
  }

  if (isPlannedRestDay(habit, dateStr)) {
    return false;
  }

  if (isFrozen) {
    return false;
  }

  return true;
}

/**
 * Counts completions of a habit within a specific calendar week
 */
export function getWeeklyCompletionsCount(
  habitId: string,
  dateStr: string,
  logs: HabitLog[]
): number {
  const weekDates = getCalendarWeekDates(dateStr);
  return logs.filter((l) => l.habitId === habitId && l.completed && weekDates.includes(l.date)).length;
}
