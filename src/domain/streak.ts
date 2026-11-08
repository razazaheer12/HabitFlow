import { DailyStatus, Habit, HabitLog, StreakFreeze } from '../types';
import { getCalendarWeekDates, shiftDate, toLocalDateString } from './date';
import {
  getWeeklyCompletionsCount,
  isEligibleInstance,
  isHabitScheduledForDate,
  isPlannedRestDay
} from './schedule';

export interface StreakMetrics {
  currentStreak: number;
  longestStreak: number;
  totalCompletions: number;
  streakUnit: 'days' | 'weeks';
  statusToday: DailyStatus;
  isCompletedToday: boolean;
  isFrozenToday: boolean;
}

/**
 * Checks if a specific habit is covered by a freeze record on dateStr
 */
export function isHabitFrozen(habitId: string, dateStr: string, freezes: StreakFreeze[]): boolean {
  return freezes.some(
    (f) => f.date === dateStr && (!f.habitId || f.habitId === habitId)
  );
}

/**
 * Checks if habit is completed on dateStr
 */
export function isHabitCompleted(habitId: string, dateStr: string, logs: HabitLog[]): boolean {
  return logs.some((l) => l.habitId === habitId && l.date === dateStr && l.completed);
}

/**
 * Resolves the distinguishable 4-state status for a habit on a date:
 * - 'completed': Done
 * - 'frozen': Preserved by streak freeze / holiday mode
 * - 'skipped': Planned rest day or pending scheduled day
 * - 'missed': Past scheduled day that was not completed and not frozen
 */
export function resolveHabitDailyStatus(
  habit: Habit,
  dateStr: string,
  logs: HabitLog[],
  freezes: StreakFreeze[],
  todayStr: string = toLocalDateString()
): DailyStatus {
  const completed = isHabitCompleted(habit.id, dateStr, logs);
  if (completed) return 'completed';

  const frozen = isHabitFrozen(habit.id, dateStr, freezes);
  if (frozen) return 'frozen';

  const scheduled = isHabitScheduledForDate(habit, dateStr);
  const restDay = isPlannedRestDay(habit, dateStr);

  if (!scheduled || restDay) {
    return 'skipped';
  }

  // If in the future or today pending
  if (dateStr >= todayStr) {
    return 'skipped';
  }

  // Past scheduled day that was not done and not frozen
  return 'missed';
}

/**
 * Calculates streak for daily or specific-weekday habits
 */
function calculateConsecutiveDayStreak(
  habit: Habit,
  logs: HabitLog[],
  freezes: StreakFreeze[],
  referenceDateStr: string = toLocalDateString()
): StreakMetrics {
  const isCompletedToday = isHabitCompleted(habit.id, referenceDateStr, logs);
  const isFrozenToday = isHabitFrozen(habit.id, referenceDateStr, freezes);
  const statusToday = resolveHabitDailyStatus(habit, referenceDateStr, logs, freezes, referenceDateStr);
  const totalCompletions = logs.filter((l) => l.habitId === habit.id && l.completed).length;

  let currentStreak = 0;
  let checkDate = referenceDateStr;

  // Rule: An incomplete current day must not prematurely reset an otherwise active streak!
  if (isCompletedToday) {
    currentStreak += 1;
    checkDate = shiftDate(checkDate, -1);
  } else {
    // If today is not done (or is frozen), streak is measured from yesterday backwards
    checkDate = shiftDate(checkDate, -1);
  }

  const createdDate = habit.createdAt ? habit.createdAt.slice(0, 10) : '2000-01-01';

  // Walk backwards up to 365 days
  for (let i = 0; i < 365; i++) {
    if (checkDate < createdDate) break;

    // Exclude planned rest days from breaking the streak
    if (isPlannedRestDay(habit, checkDate)) {
      checkDate = shiftDate(checkDate, -1);
      continue;
    }

    if (!isHabitScheduledForDate(habit, checkDate)) {
      checkDate = shiftDate(checkDate, -1);
      continue;
    }

    const completed = isHabitCompleted(habit.id, checkDate, logs);
    const frozen = isHabitFrozen(habit.id, checkDate, freezes);

    if (completed) {
      currentStreak += 1;
      checkDate = shiftDate(checkDate, -1);
    } else if (frozen) {
      // Freeze preserves streak without advancing count
      checkDate = shiftDate(checkDate, -1);
    } else {
      // Missed scheduled day: streak terminates
      break;
    }
  }

  // Calculate historical longest streak
  let longestStreak = currentStreak;
  let running = 0;

  // Audit past 180 days forward
  const pastDates: string[] = [];
  for (let d = 180; d >= 0; d--) {
    pastDates.push(shiftDate(referenceDateStr, -d));
  }

  for (const d of pastDates) {
    if (d < createdDate) continue;
    if (isPlannedRestDay(habit, d) || !isHabitScheduledForDate(habit, d)) {
      continue;
    }
    const completed = isHabitCompleted(habit.id, d, logs);
    const frozen = isHabitFrozen(habit.id, d, freezes);

    if (completed) {
      running += 1;
      if (running > longestStreak) longestStreak = running;
    } else if (!frozen) {
      running = 0;
    }
  }

  return {
    currentStreak,
    longestStreak: Math.max(longestStreak, currentStreak),
    totalCompletions,
    streakUnit: 'days',
    statusToday,
    isCompletedToday,
    isFrozenToday
  };
}

/**
 * Calculates streak for weekly-target habits (successful consecutive weeks)
 * Rule: Weekly-target habits must calculate streaks using successful weeks rather than consecutive days.
 */
function calculateWeeklyTargetStreak(
  habit: Habit,
  logs: HabitLog[],
  freezes: StreakFreeze[],
  referenceDateStr: string = toLocalDateString()
): StreakMetrics {
  const targetCount = habit.schedule.targetCount || 3;
  const isCompletedToday = isHabitCompleted(habit.id, referenceDateStr, logs);
  const isFrozenToday = isHabitFrozen(habit.id, referenceDateStr, freezes);
  const statusToday = resolveHabitDailyStatus(habit, referenceDateStr, logs, freezes, referenceDateStr);
  const totalCompletions = logs.filter((l) => l.habitId === habit.id && l.completed).length;

  const currentWeekCompletions = getWeeklyCompletionsCount(habit.id, referenceDateStr, logs);
  const isCurrentWeekMet = currentWeekCompletions >= targetCount;

  let currentStreak = 0;
  // If current week already achieved target, start with 1 week
  if (isCurrentWeekMet) {
    currentStreak += 1;
  }

  // Iterate backwards week by week (each step 7 days)
  let checkMonday = getCalendarWeekDates(referenceDateStr)[0];
  const createdDate = habit.createdAt ? habit.createdAt.slice(0, 10) : '2000-01-01';

  for (let w = 0; w < 52; w++) {
    checkMonday = shiftDate(checkMonday, -7);
    if (checkMonday < createdDate) break;

    const count = getWeeklyCompletionsCount(habit.id, checkMonday, logs);
    const weekDates = getCalendarWeekDates(checkMonday);
    const isWeekFrozen = freezes.some(
      (f) => weekDates.includes(f.date) && (!f.habitId || f.habitId === habit.id)
    );

    if (count >= targetCount) {
      currentStreak += 1;
    } else if (isWeekFrozen) {
      // Freeze preserves the weekly streak
      continue;
    } else {
      break;
    }
  }

  // Historical longest successful-week streak (forward scan over past weeks).
  // A met week advances the run; a frozen week preserves it; an unmet,
  // unfrozen week resets it.
  const startMonday = getCalendarWeekDates(referenceDateStr)[0];
  const mondays: string[] = [];
  for (let w = 104; w >= 0; w--) {
    const monday = shiftDate(startMonday, -7 * w);
    if (monday >= createdDate) mondays.push(monday);
  }

  let longestStreak = currentStreak;
  let runningWeeks = 0;
  for (const monday of mondays) {
    const count = getWeeklyCompletionsCount(habit.id, monday, logs);
    const weekDates = getCalendarWeekDates(monday);
    const weekFrozen = freezes.some(
      (f) => weekDates.includes(f.date) && (!f.habitId || f.habitId === habit.id)
    );

    if (count >= targetCount) {
      runningWeeks += 1;
      if (runningWeeks > longestStreak) longestStreak = runningWeeks;
    } else if (weekFrozen) {
      continue;
    } else {
      runningWeeks = 0;
    }
  }

  return {
    currentStreak,
    longestStreak: Math.max(longestStreak, currentStreak),
    totalCompletions,
    streakUnit: 'weeks',
    statusToday,
    isCompletedToday,
    isFrozenToday
  };
}

/**
 * Public facade to calculate streak metrics for any habit
 */
export function calculateHabitStreak(
  habit: Habit,
  logs: HabitLog[],
  freezes: StreakFreeze[],
  referenceDateStr: string = toLocalDateString()
): StreakMetrics {
  if (habit.schedule.type === 'times_per_week') {
    return calculateWeeklyTargetStreak(habit, logs, freezes, referenceDateStr);
  }
  return calculateConsecutiveDayStreak(habit, logs, freezes, referenceDateStr);
}

/**
 * Calculates global application streak across all active habits
 */
export function calculateGlobalStreak(
  habits: Habit[],
  logs: HabitLog[],
  freezes: StreakFreeze[],
  referenceDateStr: string = toLocalDateString()
): { currentStreak: number; longestStreak: number; todayRate: number; totalCompletions: number } {
  const activeHabits = habits.filter((h) => !h.archived);
  if (activeHabits.length === 0) {
    return { currentStreak: 0, longestStreak: 0, todayRate: 0, totalCompletions: 0 };
  }

  // Today stats: calculate completion percentage among ELIGIBLE scheduled instances
  // Rule 6: Completed scheduled instances / Eligible scheduled instances * 100
  // Exclude planned rest days and valid excused/frozen days from denominator!
  let completedEligible = 0;
  let totalEligible = 0;

  for (const h of activeHabits) {
    const frozen = isHabitFrozen(h.id, referenceDateStr, freezes);
    const eligible = isEligibleInstance(h, referenceDateStr, frozen);
    if (eligible) {
      totalEligible += 1;
      if (isHabitCompleted(h.id, referenceDateStr, logs)) {
        completedEligible += 1;
      }
    }
  }

  const todayRate = totalEligible > 0 ? Math.round((completedEligible / totalEligible) * 100) : 0;
  const isGlobalFrozenToday = freezes.some((f) => f.date === referenceDateStr && !f.habitId);

  let currentStreak = 0;
  let checkDate = referenceDateStr;

  if (completedEligible > 0) {
    currentStreak += 1;
    checkDate = shiftDate(checkDate, -1);
  } else if (isGlobalFrozenToday) {
    checkDate = shiftDate(checkDate, -1);
  } else {
    // Incomplete today doesn't reset streak
    checkDate = shiftDate(checkDate, -1);
  }

  for (let i = 0; i < 365; i++) {
    let dayEligible = 0;
    let dayDone = 0;

    for (const h of activeHabits) {
      const frozen = isHabitFrozen(h.id, checkDate, freezes);
      if (isEligibleInstance(h, checkDate, frozen)) {
        dayEligible += 1;
        if (isHabitCompleted(h.id, checkDate, logs)) {
          dayDone += 1;
        }
      }
    }

    const isGlobalFrozen = freezes.some((f) => f.date === checkDate && !f.habitId);

    if (dayEligible === 0) {
      // Rest or all frozen day
      checkDate = shiftDate(checkDate, -1);
      continue;
    }

    if (dayDone > 0) {
      currentStreak += 1;
      checkDate = shiftDate(checkDate, -1);
    } else if (isGlobalFrozen) {
      checkDate = shiftDate(checkDate, -1);
    } else {
      break;
    }
  }

  const totalCompletions = logs.filter((l) => l.completed).length;

  // Historical longest global streak (forward scan over the past year).
  // A day with any completion advances the run; a day with no eligible
  // instances (rest/all-frozen) or a global Holiday Mode freeze preserves it;
  // an eligible day with zero completions resets it.
  let longestStreak = currentStreak;
  let running = 0;
  for (let d = 365; d >= 0; d--) {
    const date = shiftDate(referenceDateStr, -d);
    let dayEligible = 0;
    let dayDone = 0;
    for (const h of activeHabits) {
      const frozen = isHabitFrozen(h.id, date, freezes);
      if (isEligibleInstance(h, date, frozen)) {
        dayEligible += 1;
        if (isHabitCompleted(h.id, date, logs)) dayDone += 1;
      }
    }
    const dayGlobalFrozen = freezes.some((f) => f.date === date && !f.habitId);

    if (dayEligible === 0) {
      continue;
    }
    if (dayDone > 0) {
      running += 1;
      if (running > longestStreak) longestStreak = running;
    } else if (dayGlobalFrozen) {
      continue;
    } else {
      running = 0;
    }
  }

  return {
    currentStreak,
    longestStreak: Math.max(longestStreak, currentStreak),
    todayRate,
    totalCompletions
  };
}

/**
 * Returns the count of distinct calendar dates frozen in a specific month (YYYY-MM).
 * A global freeze or one/more individual freezes on that date each consume 1 day of allowance.
 */
export function getUniqueFrozenDatesCount(freezes: StreakFreeze[], yearMonth: string): number {
  const datesInMonth = new Set(
    freezes.filter((f) => f.date.startsWith(yearMonth)).map((f) => f.date)
  );
  return datesInMonth.size;
}

/**
 * Calculates remaining freeze allowance for a month.
 * Automatically resets on the 1st of each calendar month.
 */
export function getRemainingFreezeAllowance(
  monthlyAllowance: number,
  freezes: StreakFreeze[],
  yearMonth: string = toLocalDateString().slice(0, 7)
): number {
  const used = getUniqueFrozenDatesCount(freezes, yearMonth);
  return Math.max(0, monthlyAllowance - used);
}
