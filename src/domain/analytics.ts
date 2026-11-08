import { CategoryStat, Habit, HabitCategory, HabitLog, HeatmapDay, StreakFreeze, CATEGORIES } from '../types';
import { fromLocalDateString, getCalendarWeekKey, shiftDate, toLocalDateString } from './date';
import { isEligibleInstance, isHabitScheduledForDate, isPlannedRestDay } from './schedule';
import { isHabitCompleted, isHabitFrozen } from './streak';

/**
 * ANALYTICS COUNTING MODEL
 * ---------------------------------------------------------------------------
 * The atomic unit of every aggregate metric on this screen is a SCHEDULED
 * CHECK-IN, never a habit. A habit can contribute many check-ins over a date
 * range (one per eligible day), or — for weekly-target habits — a bounded
 * quota per calendar week.
 *
 * Eligibility rules (shared with the streak engine):
 *   - A day before the habit's creation date contributes nothing.
 *   - A day after the habit's archive date contributes nothing.
 *   - Planned rest days (specific_days schedules on an off weekday) are excluded.
 *   - Frozen days (individual freeze or Holiday Mode) are excluded from BOTH
 *     numerator and denominator.
 *   - FUTURE days (after the reference date) are excluded, so a partially
 *     elapsed week/month is measured only over days that have actually arrived.
 *
 * Weekly-target (`times_per_week`) habits:
 *   Each Monday-start calendar week contributes `min(targetCount, availableDays)`
 *   eligible check-ins, where availableDays is the number of non-frozen days of
 *   that week that fall inside the analysed range and the habit's active life.
 *   Completions are capped at that quota, so a weekly habit can never push a
 *   rate above 100% and never inflates the denominator to 7/week.
 */

export interface CheckinTotals {
  eligible: number;
  completed: number;
}

/**
 * Counts eligible and completed check-ins contributed by ONE habit across a set
 * of calendar dates, applying the weekly-quota model for times_per_week habits.
 *
 * `dates` must all be <= referenceDateStr for correct future-exclusion; dates
 * after the reference are dropped defensively regardless.
 */
export function computeHabitCheckins(
  habit: Habit,
  dates: string[],
  logs: HabitLog[],
  freezes: StreakFreeze[],
  referenceDateStr: string = toLocalDateString()
): CheckinTotals {
  const createdDate = habit.createdAt ? habit.createdAt.slice(0, 10) : '2000-01-01';
  const archivedDate = habit.archived && habit.archivedAt ? habit.archivedAt.slice(0, 10) : null;

  // Keep only dates inside the habit's active life and not in the future.
  const liveDates = dates.filter(
    (d) => d >= createdDate && d <= referenceDateStr && (!archivedDate || d <= archivedDate)
  );

  if (liveDates.length === 0) return { eligible: 0, completed: 0 };

  const schedule = habit.schedule || { type: 'daily' };

  if (schedule.type === 'times_per_week') {
    const targetCount = Math.max(1, schedule.targetCount || 3);

    // Bucket the live dates by Monday-start calendar week.
    const weeks = new Map<string, string[]>();
    for (const d of liveDates) {
      const key = getCalendarWeekKey(d);
      const arr = weeks.get(key);
      if (arr) arr.push(d);
      else weeks.set(key, [d]);
    }

    let eligible = 0;
    let completed = 0;
    for (const weekDates of weeks.values()) {
      // A frozen day removes one unit of availability for the week.
      const availableDays = weekDates.filter((d) => !isHabitFrozen(habit.id, d, freezes)).length;
      if (availableDays === 0) continue;

      const quota = Math.min(targetCount, availableDays);
      const weekCompletions = weekDates.filter(
        (d) => isHabitCompleted(habit.id, d, logs) && !isHabitFrozen(habit.id, d, freezes)
      ).length;

      eligible += quota;
      completed += Math.min(weekCompletions, quota);
    }

    return { eligible, completed };
  }

  // daily + specific_days: one eligible check-in per qualifying day.
  let eligible = 0;
  let completed = 0;
  for (const d of liveDates) {
    const frozen = isHabitFrozen(habit.id, d, freezes);
    if (isEligibleInstance(habit, d, frozen)) {
      eligible += 1;
      if (isHabitCompleted(habit.id, d, logs)) completed += 1;
    }
  }
  return { eligible, completed };
}

/**
 * Aggregates check-in totals across all ACTIVE (non-archived) habits for a set
 * of dates. Returns `hasData: false` when the denominator is zero so the UI can
 * render a "No scheduled habits" state instead of a misleading 0%.
 */
export function calculateStatsForDates(
  habits: Habit[],
  logs: HabitLog[],
  freezes: StreakFreeze[],
  dates: string[],
  referenceDateStr: string = toLocalDateString()
): { completed: number; scheduled: number; rate: number; hasData: boolean } {
  const activeHabits = habits.filter((h) => !h.archived);
  let scheduled = 0;
  let completed = 0;

  for (const h of activeHabits) {
    const totals = computeHabitCheckins(h, dates, logs, freezes, referenceDateStr);
    scheduled += totals.eligible;
    completed += totals.completed;
  }

  const hasData = scheduled > 0;
  const rate = hasData ? Math.round((completed / scheduled) * 100) : 0;
  return { completed, scheduled, rate, hasData };
}

/**
 * Weighted OVERALL completion rate across every active habit for the trailing
 * `daysCount` days ending at endDateStr. This is the single source of truth for
 * the "Overall" figure on the Analytics screen (total completed eligible
 * check-ins / total eligible scheduled check-ins) — NOT a count of active days
 * and NOT an unweighted average of per-category or per-habit percentages.
 */
export function calculateOverallCompletionRate(
  habits: Habit[],
  logs: HabitLog[],
  freezes: StreakFreeze[],
  daysCount: number = 30,
  endDateStr: string = toLocalDateString()
): { completed: number; scheduled: number; rate: number; hasData: boolean } {
  const dates: string[] = [];
  for (let i = 0; i < daysCount; i++) {
    dates.push(shiftDate(endDateStr, -i));
  }
  return calculateStatsForDates(habits, logs, freezes, dates, endDateStr);
}

/**
 * Week-over-week comparison using CALENDAR weeks measured to-date.
 *
 * Current period = Monday of the reference week through the reference date
 * (week-to-date). Previous period = Monday of the prior week through the SAME
 * weekday (an equal number of elapsed days), e.g. Mon-Sat vs the previous
 * Mon-Sat. Both windows are local-timezone calendar dates.
 */
export function calculateWeekOverWeekComparison(
  habits: Habit[],
  logs: HabitLog[],
  freezes: StreakFreeze[],
  referenceDateStr: string = toLocalDateString()
) {
  const refDate = fromLocalDateString(referenceDateStr);
  const diffToMonday = refDate.getDay() === 0 ? -6 : 1 - refDate.getDay();
  const mondayStr = shiftDate(referenceDateStr, diffToMonday);
  const elapsedDays = Math.round(
    (fromLocalDateString(referenceDateStr).getTime() - fromLocalDateString(mondayStr).getTime()) / 86400000
  ) + 1; // inclusive count of days from Monday to the reference date

  const currentWeekDates: string[] = [];
  for (let i = 0; i < elapsedDays; i++) currentWeekDates.push(shiftDate(mondayStr, i));

  const prevMondayStr = shiftDate(mondayStr, -7);
  const prevWeekDates: string[] = [];
  for (let i = 0; i < elapsedDays; i++) prevWeekDates.push(shiftDate(prevMondayStr, i));

  const currentStats = calculateStatsForDates(habits, logs, freezes, currentWeekDates, referenceDateStr);
  const prevStats = calculateStatsForDates(habits, logs, freezes, prevWeekDates, referenceDateStr);

  return {
    currentPeriodLabel: 'This Week (to date)',
    previousPeriodLabel: 'Last Week (same days)',
    currentCompleted: currentStats.completed,
    currentScheduled: currentStats.scheduled,
    currentRate: currentStats.rate,
    currentHasData: currentStats.hasData,
    previousCompleted: prevStats.completed,
    previousScheduled: prevStats.scheduled,
    previousRate: prevStats.rate,
    previousHasData: prevStats.hasData,
    // Percentage-point difference: current rate minus previous rate.
    rateDelta: currentStats.rate - prevStats.rate,
    comparable: currentStats.hasData || prevStats.hasData
  };
}

/**
 * Month-over-month comparison using calendar months measured to-date.
 *
 * Current period = the 1st of the reference month through the reference date
 * (month-to-date). Previous period = the 1st of the prior month through the same
 * day number, CLAMPED to the prior month's final day when it is shorter (e.g.
 * referencing the 31st compares against a 30- or 28/29-day previous month).
 */
export function calculateMonthOverMonthComparison(
  habits: Habit[],
  logs: HabitLog[],
  freezes: StreakFreeze[],
  referenceDateStr: string = toLocalDateString()
) {
  const refDate = fromLocalDateString(referenceDateStr);
  const curYear = refDate.getFullYear();
  const curMonth = refDate.getMonth(); // 0-indexed
  const curDay = refDate.getDate();

  const buildMonthDates = (year: number, month0: number, throughDay: number): string[] => {
    const daysInMonth = new Date(year, month0 + 1, 0).getDate();
    const end = Math.min(throughDay, daysInMonth);
    const out: string[] = [];
    for (let day = 1; day <= end; day++) {
      const mStr = String(month0 + 1).padStart(2, '0');
      const dStr = String(day).padStart(2, '0');
      out.push(`${year}-${mStr}-${dStr}`);
    }
    return out;
  };

  const currentMonthDates = buildMonthDates(curYear, curMonth, curDay);

  const prevDate = new Date(curYear, curMonth, 0); // last day of previous month
  const prevYear = prevDate.getFullYear();
  const prevMonth = prevDate.getMonth();
  const prevMonthDates = buildMonthDates(prevYear, prevMonth, curDay); // clamped inside builder

  const currentStats = calculateStatsForDates(habits, logs, freezes, currentMonthDates, referenceDateStr);
  const prevStats = calculateStatsForDates(habits, logs, freezes, prevMonthDates, referenceDateStr);

  return {
    currentPeriodLabel: 'This Month (to date)',
    previousPeriodLabel: 'Last Month (same days)',
    currentCompleted: currentStats.completed,
    currentScheduled: currentStats.scheduled,
    currentRate: currentStats.rate,
    currentHasData: currentStats.hasData,
    previousCompleted: prevStats.completed,
    previousScheduled: prevStats.scheduled,
    previousRate: prevStats.rate,
    previousHasData: prevStats.hasData,
    rateDelta: currentStats.rate - prevStats.rate,
    comparable: currentStats.hasData || prevStats.hasData
  };
}

/**
 * Calculates category breakdown over the trailing `daysCount` days using the
 * quota-aware check-in model. Each category's rate is its OWN completed
 * eligible check-ins / its OWN eligible scheduled check-ins. Categories with a
 * zero denominator report completionRate 0 with scheduledCount 0; the UI reads
 * scheduledCount === 0 as "No data" rather than a real 0%.
 */
export function calculateCategoryBreakdown(
  habits: Habit[],
  logs: HabitLog[],
  freezes: StreakFreeze[],
  daysCount: number = 30,
  endDateStr: string = toLocalDateString()
): CategoryStat[] {
  const categories = Object.keys(CATEGORIES) as HabitCategory[];
  const pastDates: string[] = [];
  for (let i = 0; i < daysCount; i++) {
    pastDates.push(shiftDate(endDateStr, -i));
  }

  return categories.map((catKey) => {
    const catHabits = habits.filter((h) => !h.archived && h.category === catKey);
    let scheduledCount = 0;
    let completedCount = 0;

    for (const habit of catHabits) {
      const totals = computeHabitCheckins(habit, pastDates, logs, freezes, endDateStr);
      scheduledCount += totals.eligible;
      completedCount += totals.completed;
    }

    const completionRate = scheduledCount > 0 ? Math.round((completedCount / scheduledCount) * 100) : 0;

    return {
      category: catKey,
      name: CATEGORIES[catKey].name,
      activeCount: catHabits.length,
      completedCount,
      scheduledCount,
      completionRate
    };
  });
}

/**
 * Calculates the per-day heatmap grid. The heatmap is intentionally a DAY-LEVEL
 * density view, so each eligible day contributes one cell unit (weekly-target
 * habits show as available on their eligible days). Future dates never appear
 * because the window always ends at endDateStr.
 *
 * Intensity buckets by completion percentage:
 *   0% -> 0 (faint) | 1-39% -> 1 | 40-74% -> 2 | 75-99% -> 3 | 100% -> 4 (vivid)
 */
export function calculatePercentageHeatmap(
  habits: Habit[],
  logs: HabitLog[],
  freezes: StreakFreeze[],
  daysCount: number = 119, // 17 weeks
  endDateStr: string = toLocalDateString()
): HeatmapDay[] {
  const activeHabits = habits.filter((h) => !h.archived);
  const result: HeatmapDay[] = [];

  for (let i = daysCount - 1; i >= 0; i--) {
    const dateStr = shiftDate(endDateStr, -i);
    let eligibleCount = 0;
    let completedCount = 0;

    for (const h of activeHabits) {
      // Day-level eligibility; skips pre-creation, post-archive, rest and frozen days.
      if (!isHabitScheduledForDate(h, dateStr)) continue;
      if (isPlannedRestDay(h, dateStr)) continue;
      const frozen = isHabitFrozen(h.id, dateStr, freezes);
      if (frozen) continue;
      eligibleCount += 1;
      if (isHabitCompleted(h.id, dateStr, logs)) completedCount += 1;
    }

    const isFrozen =
      eligibleCount === 0 &&
      freezes.some(
        (f) => f.date === dateStr && (!f.habitId || activeHabits.every((h) => isHabitFrozen(h.id, dateStr, freezes)))
      );

    const percentage = eligibleCount > 0 ? Math.round((completedCount / eligibleCount) * 100) : 0;

    let intensity: 0 | 1 | 2 | 3 | 4 = 0;
    if (completedCount > 0) {
      if (percentage >= 100) intensity = 4;
      else if (percentage >= 75) intensity = 3;
      else if (percentage >= 40) intensity = 2;
      else intensity = 1;
    }

    result.push({
      date: dateStr,
      completedCount,
      eligibleCount,
      percentage,
      isFrozen,
      intensity
    });
  }

  return result;
}

/**
 * Identifies the best-performing category, considering ONLY categories that
 * have valid eligible data (scheduledCount > 0 and at least one active habit).
 * Categories with no eligible check-ins are never selected.
 */
export function getBestPerformingCategory(categoryStats: CategoryStat[]): CategoryStat | null {
  const eligible = categoryStats.filter((c) => c.scheduledCount > 0 && c.activeCount > 0);
  if (eligible.length === 0) return null;

  return eligible.reduce((best, curr) => {
    if (curr.completionRate > best.completionRate) return curr;
    if (curr.completionRate === best.completionRate && curr.completedCount > best.completedCount) return curr;
    return best;
  }, eligible[0]);
}
