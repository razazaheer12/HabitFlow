import test from 'node:test';
import assert from 'node:assert/strict';
import {
  shiftDate,
  getCalendarWeekDates,
  getCalendarWeekKey
} from './date';
import {
  isHabitScheduledForDate,
  isPlannedRestDay,
  resolveScheduleForDate
} from './schedule';
import {
  calculateHabitStreak,
  calculateGlobalStreak,
  getRemainingFreezeAllowance,
  getUniqueFrozenDatesCount
} from './streak';
import {
  calculatePercentageHeatmap,
  calculateWeekOverWeekComparison,
  calculateMonthOverMonthComparison,
  getBestPerformingCategory,
  calculateStatsForDates,
  calculateOverallCompletionRate,
  calculateCategoryBreakdown,
  computeHabitCheckins
} from './analytics';
import { validateBackupPayload, mergeBackupWithState, migrateBackupPayload } from '../storage/schema';
import { Habit, HabitLog, StreakFreeze } from '../types';

// ==========================================
// 1. DATE CALCULATIONS
// ==========================================
test('Date calculations: shiftDate accurately preserves calendar dates', () => {
  assert.equal(shiftDate('2026-11-04', 1), '2026-11-05');
  assert.equal(shiftDate('2026-11-01', -1), '2026-10-31');
  assert.equal(shiftDate('2026-02-28', 1), '2026-03-01');
});

test('Date calculations: getCalendarWeekDates returns Monday through Sunday', () => {
  // 2026-11-04 is a Wednesday
  const weekDates = getCalendarWeekDates('2026-11-04');
  assert.equal(weekDates.length, 7);
  assert.equal(weekDates[0], '2026-11-02'); // Monday
  assert.equal(weekDates[6], '2026-11-08'); // Sunday
});

test('Date calculations: getCalendarWeekKey produces stable ISO week identifier', () => {
  assert.equal(getCalendarWeekKey('2026-11-04'), '2026-W45');
});

// ==========================================
// 2. SCHEDULING RULES
// ==========================================
test('Scheduling rules: daily, weekday, and weekly targets', () => {
  const dailyHabit: Habit = {
    id: 'h-daily',
    title: 'Daily Water',
    category: 'health',
    schedule: { type: 'daily' },
    createdAt: '2026-11-01T00:00:00Z',
    updatedAt: '2026-11-01T00:00:00Z'
  };

  const weekdayHabit: Habit = {
    id: 'h-work',
    title: 'Work Sprint',
    category: 'productivity',
    schedule: { type: 'specific_days', days: [1, 2, 3, 4, 5] }, // Mon-Fri
    createdAt: '2026-11-01T00:00:00Z',
    updatedAt: '2026-11-01T00:00:00Z'
  };

  // 2026-11-04 is Wednesday (weekday 3)
  assert.equal(isHabitScheduledForDate(dailyHabit, '2026-11-04'), true);
  assert.equal(isHabitScheduledForDate(weekdayHabit, '2026-11-04'), true);
  assert.equal(isPlannedRestDay(weekdayHabit, '2026-11-04'), false);

  // 2026-11-07 is Saturday (weekday 6) -> planned rest day for weekday habit!
  assert.equal(isHabitScheduledForDate(weekdayHabit, '2026-11-07'), false);
  assert.equal(isPlannedRestDay(weekdayHabit, '2026-11-07'), true);
});

test('Scheduling rules: archived habits are not scheduled after archivedAt date', () => {
  const archivedHabit: Habit = {
    id: 'h-archived',
    title: 'Past Goal',
    category: 'learning',
    schedule: { type: 'daily' },
    createdAt: '2026-10-01T00:00:00Z',
    updatedAt: '2026-11-02T00:00:00Z',
    archived: true,
    archivedAt: '2026-11-02T12:00:00Z'
  };

  assert.equal(isHabitScheduledForDate(archivedHabit, '2026-11-01'), true);
  assert.equal(isHabitScheduledForDate(archivedHabit, '2026-11-03'), false);
});

// ==========================================
// 3. STREAK CALCULATIONS
// ==========================================
test('Streak calculations: planned rest days are excluded and do not break streak', () => {
  const weekdayHabit: Habit = {
    id: 'h-weekday',
    title: 'Work Sprint',
    category: 'productivity',
    schedule: { type: 'specific_days', days: [1, 2, 3, 4, 5] }, // Mon-Fri
    createdAt: '2026-10-25T00:00:00Z',
    updatedAt: '2026-10-25T00:00:00Z'
  };

  // User completed Friday (Oct 30), Saturday (Oct 31) & Sunday (Nov 1) were planned rest days,
  // User completed Monday (Nov 2)
  const logs: HabitLog[] = [
    { id: '1', habitId: 'h-weekday', date: '2026-10-30', completed: true },
    { id: '2', habitId: 'h-weekday', date: '2026-11-02', completed: true }
  ];

  const streak = calculateHabitStreak(weekdayHabit, logs, [], '2026-11-02');
  // Weekend was rest days; Friday + Monday = 2-day consecutive streak!
  assert.equal(streak.currentStreak, 2);
  assert.equal(streak.streakUnit, 'days');
});

test('Streak calculations: incomplete current day does not prematurely reset active streak', () => {
  const dailyHabit: Habit = {
    id: 'h-med',
    title: 'Meditation',
    category: 'mind',
    schedule: { type: 'daily' },
    createdAt: '2026-11-01T00:00:00Z',
    updatedAt: '2026-11-01T00:00:00Z'
  };

  // User completed Nov 1, Nov 2, Nov 3. Today is Nov 4 and habit is incomplete so far.
  const logs: HabitLog[] = [
    { id: '1', habitId: 'h-med', date: '2026-11-01', completed: true },
    { id: '2', habitId: 'h-med', date: '2026-11-02', completed: true },
    { id: '3', habitId: 'h-med', date: '2026-11-03', completed: true }
  ];

  const streak = calculateHabitStreak(dailyHabit, logs, [], '2026-11-04');
  // Incomplete today must preserve the 3-day streak from yesterday!
  assert.equal(streak.currentStreak, 3);
  assert.equal(streak.isCompletedToday, false);
});

test('Streak calculations: streak freeze bridges missed days without resetting', () => {
  const dailyHabit: Habit = {
    id: 'h-stretch',
    title: 'Mobility',
    category: 'fitness',
    schedule: { type: 'daily' },
    createdAt: '2026-11-01T00:00:00Z',
    updatedAt: '2026-11-01T00:00:00Z'
  };

  // Completed Nov 1, Nov 2. Nov 3 was frozen (sick day). Completed Nov 4.
  const logs: HabitLog[] = [
    { id: '1', habitId: 'h-stretch', date: '2026-11-01', completed: true },
    { id: '2', habitId: 'h-stretch', date: '2026-11-02', completed: true },
    { id: '3', habitId: 'h-stretch', date: '2026-11-04', completed: true }
  ];

  const freezes: StreakFreeze[] = [
    { id: 'f1', date: '2026-11-03', habitId: 'h-stretch', reason: 'Flu recovery', createdAt: '2026-11-03T10:00:00Z' }
  ];

  const streak = calculateHabitStreak(dailyHabit, logs, freezes, '2026-11-04');
  // Freeze bridged Nov 3 seamlessly: Nov 1 + Nov 2 + Nov 4 = 3 completions maintained
  assert.equal(streak.currentStreak, 3);
});

test('Streak calculations: weekly-target habits calculate streak using successful weeks', () => {
  const weeklyHabit: Habit = {
    id: 'h-gym',
    title: 'Gym Workout',
    category: 'fitness',
    schedule: { type: 'times_per_week', targetCount: 3 },
    createdAt: '2026-10-15T00:00:00Z',
    updatedAt: '2026-10-15T00:00:00Z'
  };

  // Previous week (Oct 26 - Nov 1): 3 completions (successful week 1)
  // Current week (Nov 2 - Nov 8): 3 completions (successful week 2)
  const logs: HabitLog[] = [
    { id: '1', habitId: 'h-gym', date: '2026-10-27', completed: true },
    { id: '2', habitId: 'h-gym', date: '2026-10-29', completed: true },
    { id: '3', habitId: 'h-gym', date: '2026-10-31', completed: true },
    { id: '4', habitId: 'h-gym', date: '2026-11-02', completed: true },
    { id: '5', habitId: 'h-gym', date: '2026-11-03', completed: true },
    { id: '6', habitId: 'h-gym', date: '2026-11-04', completed: true }
  ];

  const streak = calculateHabitStreak(weeklyHabit, logs, [], '2026-11-04');
  assert.equal(streak.currentStreak, 2);
  assert.equal(streak.streakUnit, 'weeks');
});

// ==========================================
// 4. COMPLETION RATES & ANALYTICS
// ==========================================
test('Completion rate: excludes planned rest days and frozen days from denominator', () => {
  const dailyHabit: Habit = {
    id: 'h1',
    title: 'Daily Task',
    category: 'productivity',
    schedule: { type: 'daily' },
    createdAt: '2026-11-01T00:00:00Z',
    updatedAt: '2026-11-01T00:00:00Z'
  };

  const weekendHabit: Habit = {
    id: 'h2',
    title: 'Weekend Project',
    category: 'learning',
    schedule: { type: 'specific_days', days: [0, 6] }, // Sat & Sun only
    createdAt: '2026-11-01T00:00:00Z',
    updatedAt: '2026-11-01T00:00:00Z'
  };

  const frozenHabit: Habit = {
    id: 'h3',
    title: 'Running',
    category: 'fitness',
    schedule: { type: 'daily' },
    createdAt: '2026-11-01T00:00:00Z',
    updatedAt: '2026-11-01T00:00:00Z'
  };

  // 2026-11-04 is Wednesday.
  // - h1 is eligible (daily)
  // - h2 is NOT eligible (weekend only -> planned rest day on Wed)
  // - h3 is frozen on 2026-11-04
  const freezes: StreakFreeze[] = [
    { id: 'f1', date: '2026-11-04', habitId: 'h3', reason: 'Rest day', createdAt: '2026-11-04T00:00:00Z' }
  ];

  // User completed h1
  const logs: HabitLog[] = [
    { id: '1', habitId: 'h1', date: '2026-11-04', completed: true }
  ];

  const global = calculateGlobalStreak([dailyHabit, weekendHabit, frozenHabit], logs, freezes, '2026-11-04');
  // Denominator is 1 (only h1 is eligible). h1 is done -> 100%!
  assert.equal(global.todayRate, 100);
});

// ==========================================
// 5. HEATMAP INTENSITY (PERCENTAGE-BASED)
// ==========================================
test('Heatmap intensity uses percentage scale: 0=0%, 1=1-39%, 2=40-74%, 3=75-99%, 4=100%', () => {
  const h1: Habit = { id: 'h1', title: 'H1', category: 'health', schedule: { type: 'daily' }, createdAt: '2026-11-01T00:00:00Z', updatedAt: '2026-11-01T00:00:00Z' };
  const h2: Habit = { id: 'h2', title: 'H2', category: 'mind', schedule: { type: 'daily' }, createdAt: '2026-11-01T00:00:00Z', updatedAt: '2026-11-01T00:00:00Z' };

  // 2 eligible habits.
  // On 2026-11-03: 1 of 2 completed = 50% -> intensity 2
  // On 2026-11-04: 2 of 2 completed = 100% -> intensity 4
  const logs: HabitLog[] = [
    { id: '1', habitId: 'h1', date: '2026-11-03', completed: true },
    { id: '2', habitId: 'h1', date: '2026-11-04', completed: true },
    { id: '3', habitId: 'h2', date: '2026-11-04', completed: true }
  ];

  const heatmap = calculatePercentageHeatmap([h1, h2], logs, [], 2, '2026-11-04');
  assert.equal(heatmap[0].date, '2026-11-03');
  assert.equal(heatmap[0].percentage, 50);
  assert.equal(heatmap[0].intensity, 2);

  assert.equal(heatmap[1].date, '2026-11-04');
  assert.equal(heatmap[1].percentage, 100);
  assert.equal(heatmap[1].intensity, 4);
});

// ==========================================
// 6. BACKUP & RESTORE VALIDATION & MERGE
// ==========================================
test('Backup validation: rejects invalid JSON and missing arrays', () => {
  assert.equal(validateBackupPayload('not json').valid, false);
  assert.equal(validateBackupPayload('{}').valid, false);
  assert.equal(validateBackupPayload(JSON.stringify({ habits: [] })).valid, false); // missing logs
  assert.equal(validateBackupPayload(JSON.stringify({ habits: [], logs: [] })).valid, true);
});

test('Backup merge: merges records safely by ID and date without duplicate keys', () => {
  const existingHabit: Habit = {
    id: 'h-1',
    title: 'Existing Habit',
    category: 'mind',
    schedule: { type: 'daily' },
    createdAt: '2026-10-01T00:00:00Z',
    updatedAt: '2026-10-01T00:00:00Z'
  };

  const incomingHabit: Habit = {
    id: 'h-2',
    title: 'Imported Habit',
    category: 'learning',
    schedule: { type: 'daily' },
    createdAt: '2026-10-01T00:00:00Z',
    updatedAt: '2026-10-01T00:00:00Z'
  };

  const merged = mergeBackupWithState(
    { habits: [existingHabit], logs: [], notes: [], freezes: [] },
    {
      schemaVersion: 2,
      appVersion: '2.0.0',
      exportedAt: '2026-11-04T00:00:00Z',
      profile: { name: 'Alex', onboardingCompleted: true, theme: 'dark', freezeAllowance: 3, soundEnabled: true, notificationsEnabled: false },
      habits: [incomingHabit],
      logs: [],
      notes: [],
      freezes: []
    }
  );

  assert.equal(merged.habits.length, 2);
});

// ==========================================
// 7. SCHEDULE REVISIONS & HISTORICAL ACCURACY
// ==========================================
test('Schedule history: resolveScheduleForDate returns historical schedule for dates prior to revision', () => {
  const habitWithHistory: Habit = {
    id: 'h-revised',
    title: 'Workout Revision',
    category: 'fitness',
    // Current schedule is daily starting Nov 10
    schedule: { type: 'daily' },
    scheduleHistory: [
      {
        effectiveFrom: '2026-11-01',
        schedule: { type: 'specific_days', days: [1, 3, 5] } // Mon, Wed, Fri
      },
      {
        effectiveFrom: '2026-11-10',
        schedule: { type: 'daily' }
      }
    ],
    createdAt: '2026-11-01T00:00:00Z',
    updatedAt: '2026-11-10T00:00:00Z'
  };

  // On Nov 3 (Tuesday, weekday 2): according to the Nov 1 schedule (Mon/Wed/Fri), Tuesday was a rest day!
  assert.equal(isHabitScheduledForDate(habitWithHistory, '2026-11-03'), false);
  assert.equal(isPlannedRestDay(habitWithHistory, '2026-11-03'), true);

  // On Nov 4 (Wednesday, weekday 3): was scheduled!
  assert.equal(isHabitScheduledForDate(habitWithHistory, '2026-11-04'), true);

  // On Nov 11 (Wednesday): now daily schedule applies
  assert.equal(isHabitScheduledForDate(habitWithHistory, '2026-11-11'), true);
  // On Nov 10 (Tuesday): daily schedule applies
  assert.equal(isHabitScheduledForDate(habitWithHistory, '2026-11-10'), true);
});

// ==========================================
// 8. DYNAMIC MONTHLY FREEZE ACCOUNTING
// ==========================================
test('Freeze allowance: computes remaining allowance and resets per calendar month', () => {
  const freezes: StreakFreeze[] = [
    { id: 'f1', date: '2026-11-02', reason: 'Flu', createdAt: '2026-11-02T00:00:00Z' },
    { id: 'f2', date: '2026-11-03', habitId: 'h1', reason: 'Rest', createdAt: '2026-11-03T00:00:00Z' },
    // Multiple freezes on same date count as 1 frozen day
    { id: 'f3', date: '2026-11-03', habitId: 'h2', reason: 'Rest', createdAt: '2026-11-03T00:00:00Z' },
    // Freeze in previous month (October)
    { id: 'f4', date: '2026-10-25', reason: 'Vacation', createdAt: '2026-10-25T00:00:00Z' }
  ];

  // In November: 2 unique dates frozen (Nov 2, Nov 3). Allowance = 3 -> remaining = 1
  assert.equal(getRemainingFreezeAllowance(3, freezes, '2026-11'), 1);

  // In October: 1 unique date frozen (Oct 25). Allowance = 3 -> remaining = 2
  assert.equal(getRemainingFreezeAllowance(3, freezes, '2026-10'), 2);

  // In December (future month): 0 dates frozen. Allowance = 3 -> full reset remaining = 3
  assert.equal(getRemainingFreezeAllowance(3, freezes, '2026-12'), 3);
});

// ==========================================
// 9. PERIOD COMPARISONS & ZERO SAFEGUARD
// ==========================================
test('Analytics: period comparisons calculate rates, deltas, and handle zero habits gracefully', () => {
  const h: Habit = {
    id: 'h1',
    title: 'Daily Task',
    category: 'productivity',
    schedule: { type: 'daily' },
    createdAt: '2026-10-01T00:00:00Z',
    updatedAt: '2026-10-01T00:00:00Z'
  };

  // Logs across 2 weeks
  const logs: HabitLog[] = [
    // Previous 7 days (e.g. 5 completions)
    { id: '1', habitId: 'h1', date: '2026-10-22', completed: true },
    { id: '2', habitId: 'h1', date: '2026-10-23', completed: true },
    // Current 7 days (e.g. 7 completions)
    { id: '3', habitId: 'h1', date: '2026-11-01', completed: true },
    { id: '4', habitId: 'h1', date: '2026-11-02', completed: true },
    { id: '5', habitId: 'h1', date: '2026-11-03', completed: true },
    { id: '6', habitId: 'h1', date: '2026-11-04', completed: true }
  ];

  const wow = calculateWeekOverWeekComparison([h], logs, [], '2026-11-04');
  assert.equal(typeof wow.currentRate, 'number');
  assert.equal(typeof wow.previousRate, 'number');
  assert.equal(typeof wow.rateDelta, 'number');

  // Zero habits case
  const emptyWoW = calculateWeekOverWeekComparison([], [], [], '2026-11-04');
  assert.equal(emptyWoW.currentRate, 0);
  assert.equal(emptyWoW.previousRate, 0);
  assert.equal(emptyWoW.rateDelta, 0);

  // Best category selector
  const best = getBestPerformingCategory([
    { category: 'productivity', name: 'Productivity', activeCount: 1, scheduledCount: 10, completedCount: 8, completionRate: 80 },
    { category: 'fitness', name: 'Fitness & Body', activeCount: 1, scheduledCount: 10, completedCount: 9, completionRate: 90 }
  ]);
  assert.equal(best?.category, 'fitness');
});

// ==========================================
// 10. BACKUP REFERENTIAL INTEGRITY FILTERING
// ==========================================
test('Backup merge: drops orphaned logs, notes, and freezes referencing non-existent habits', () => {
  const validHabit: Habit = {
    id: 'h-valid',
    title: 'Valid Habit',
    category: 'mind',
    schedule: { type: 'daily' },
    createdAt: '2026-10-01T00:00:00Z',
    updatedAt: '2026-10-01T00:00:00Z'
  };

  const incomingBackup = {
    schemaVersion: 2,
    appVersion: '2.0.0',
    exportedAt: '2026-11-04T00:00:00Z',
    profile: { name: 'Alex', onboardingCompleted: true, theme: 'dark' as const, freezeAllowance: 3, soundEnabled: true, notificationsEnabled: false },
    habits: [validHabit],
    logs: [
      { id: 'log-1', habitId: 'h-valid', date: '2026-11-01', completed: true },
      { id: 'log-orphaned', habitId: 'h-deleted-long-ago', date: '2026-11-01', completed: true }
    ],
    notes: [
      { id: 'note-1', habitId: 'h-valid', date: '2026-11-01', note: 'Good', createdAt: '2026-11-01T00:00:00Z', updatedAt: '2026-11-01T00:00:00Z' },
      { id: 'note-orphaned', habitId: 'h-deleted-long-ago', date: '2026-11-01', note: 'Bad', createdAt: '2026-11-01T00:00:00Z', updatedAt: '2026-11-01T00:00:00Z' }
    ],
    freezes: [
      { id: 'f-global', date: '2026-11-02', reason: 'Holiday', createdAt: '2026-11-02T00:00:00Z' }, // Global freeze has no habitId -> must be kept
      { id: 'f-valid', habitId: 'h-valid', date: '2026-11-03', reason: 'Rest', createdAt: '2026-11-03T00:00:00Z' },
      { id: 'f-orphaned', habitId: 'h-deleted-long-ago', date: '2026-11-03', reason: 'Rest', createdAt: '2026-11-03T00:00:00Z' }
    ]
  };

  const merged = mergeBackupWithState(
    { habits: [], logs: [], notes: [], freezes: [] },
    incomingBackup
  );

  assert.equal(merged.habits.length, 1);
  assert.equal(merged.logs.length, 1);
  assert.equal(merged.logs[0].habitId, 'h-valid');
  assert.equal(merged.notes.length, 1);
  assert.equal(merged.notes[0].habitId, 'h-valid');
  assert.equal(merged.freezes.length, 2); // global + valid
});

// ==========================================
// 10. BUG-3 REGRESSION — HISTORICAL SCHEDULE INTEGRITY
// ==========================================
test('BUG-3: a later frequency edit cannot rewrite past scheduled days', () => {
  // Habit created Nov 1 as daily. On Nov 6 the user switches to Mon/Wed/Fri only.
  // The OLD daily schedule is archived in history (effective from creation);
  // the NEW schedule is effective only from Nov 6.
  const habit: Habit = {
    id: 'h-bug3',
    title: 'Read',
    category: 'learning',
    schedule: { type: 'specific_days', days: [1, 3, 5] }, // current (Mon/Wed/Fri)
    scheduleEffectiveFrom: '2026-11-06',
    scheduleHistory: [
      { effectiveFrom: '2026-11-01', schedule: { type: 'daily' } } // the OLD schedule
    ],
    createdAt: '2026-11-01T09:00:00Z',
    updatedAt: '2026-11-06T09:00:00Z'
  };

  // Nov 3 (Tue) falls under the OLD daily schedule -> still counts as scheduled.
  assert.equal(resolveScheduleForDate(habit, '2026-11-03').type, 'daily');
  assert.equal(isHabitScheduledForDate(habit, '2026-11-03'), true);

  // Nov 5 (Thu) also under the OLD daily schedule -> scheduled (would be a rest
  // day if the future edit had leaked backwards).
  assert.equal(isHabitScheduledForDate(habit, '2026-11-05'), true);

  // Nov 7 (Sat) is under the NEW specific_days schedule -> not scheduled.
  assert.equal(resolveScheduleForDate(habit, '2026-11-07').type, 'specific_days');
  assert.equal(isHabitScheduledForDate(habit, '2026-11-07'), false);
  assert.equal(isPlannedRestDay(habit, '2026-11-07'), true);

  // Nov 9 (Mon) under the NEW schedule -> scheduled.
  assert.equal(isHabitScheduledForDate(habit, '2026-11-09'), true);
});

// ==========================================
// 11. FREEZE TOKEN ACCOUNTING
// ==========================================
test('Freeze allowance: dedupes multiple records on one date and reports exhaustion', () => {
  const freezes: StreakFreeze[] = [
    { id: 'f1', date: '2026-11-02', reason: 'Flu', createdAt: '2026-11-02T00:00:00Z' },
    { id: 'f2', date: '2026-11-02', habitId: 'h1', reason: 'Rest', createdAt: '2026-11-02T00:00:00Z' },
    { id: 'f3', date: '2026-11-03', habitId: 'h2', reason: 'Rest', createdAt: '2026-11-03T00:00:00Z' }
  ];

  // Three records but only two distinct frozen calendar dates.
  assert.equal(getUniqueFrozenDatesCount(freezes, '2026-11'), 2);

  // Allowance of 2 is fully consumed -> exhausted (remaining 0).
  assert.equal(getRemainingFreezeAllowance(2, freezes, '2026-11'), 0);
  // Allowance of 3 leaves one token.
  assert.equal(getRemainingFreezeAllowance(3, freezes, '2026-11'), 1);
});

// ==========================================
// 12. DAILY STREAK EDGE CASES
// ==========================================
test('Streak: an incomplete current day does not reset an active streak', () => {
  const habit: Habit = {
    id: 'h-daily',
    title: 'Water',
    category: 'health',
    schedule: { type: 'daily' },
    scheduleEffectiveFrom: '2026-10-01',
    createdAt: '2026-10-01T00:00:00Z',
    updatedAt: '2026-10-01T00:00:00Z'
  };
  const logs: HabitLog[] = ['2026-11-01', '2026-11-02', '2026-11-03'].map((d, i) => ({
    id: `l${i}`,
    habitId: 'h-daily',
    date: d,
    completed: true,
    completedAt: `${d}T10:00:00Z`
  }));

  // Reference "today" is Nov 4 and is NOT yet completed.
  const metrics = calculateHabitStreak(habit, logs, [], '2026-11-04');
  assert.equal(metrics.currentStreak, 3);
});

test('Streak: a freeze day bridges completions without advancing the count', () => {
  const habit: Habit = {
    id: 'h-daily',
    title: 'Run',
    category: 'fitness',
    schedule: { type: 'daily' },
    scheduleEffectiveFrom: '2026-10-01',
    createdAt: '2026-10-01T00:00:00Z',
    updatedAt: '2026-10-01T00:00:00Z'
  };
  const logs: HabitLog[] = ['2026-11-02', '2026-11-04'].map((d, i) => ({
    id: `l${i}`,
    habitId: 'h-daily',
    date: d,
    completed: true,
    completedAt: `${d}T10:00:00Z`
  }));
  const freezes: StreakFreeze[] = [
    { id: 'f1', habitId: 'h-daily', date: '2026-11-03', reason: 'Rest', createdAt: '2026-11-03T00:00:00Z' }
  ];

  // Nov 4 done, Nov 3 frozen (preserves), Nov 2 done, Nov 1 missed -> streak 2.
  const metrics = calculateHabitStreak(habit, logs, freezes, '2026-11-04');
  assert.equal(metrics.currentStreak, 2);
  assert.equal(metrics.streakUnit, 'days');
});

test('Streak: continues correctly across a month boundary', () => {
  const habit: Habit = {
    id: 'h-daily',
    title: 'Read',
    category: 'learning',
    schedule: { type: 'daily' },
    scheduleEffectiveFrom: '2026-10-01',
    createdAt: '2026-10-01T00:00:00Z',
    updatedAt: '2026-10-01T00:00:00Z'
  };
  const logs: HabitLog[] = ['2026-10-30', '2026-10-31', '2026-11-01', '2026-11-02'].map((d, i) => ({
    id: `l${i}`,
    habitId: 'h-daily',
    date: d,
    completed: true,
    completedAt: `${d}T10:00:00Z`
  }));

  const metrics = calculateHabitStreak(habit, logs, [], '2026-11-02');
  assert.equal(metrics.currentStreak, 4);
});

// ==========================================
// 13. WEEKLY-TARGET STREAK (SUCCESSFUL WEEKS)
// ==========================================
test('Weekly target: streak counts consecutive successful weeks, not days', () => {
  const habit: Habit = {
    id: 'h-weekly',
    title: 'Deep Work',
    category: 'productivity',
    schedule: { type: 'times_per_week', targetCount: 2 },
    scheduleEffectiveFrom: '2026-10-01',
    createdAt: '2026-10-01T00:00:00Z',
    updatedAt: '2026-10-01T00:00:00Z'
  };

  const mk = (dates: string[]) =>
    dates.map((d, i) => ({
      id: `w-${d}-${i}`,
      habitId: 'h-weekly',
      date: d,
      completed: true,
      completedAt: `${d}T10:00:00Z`
    }));

  // Current week (Mon Nov 2 - Sun Nov 8): 2 completions -> met.
  // Prior week (Mon Oct 26 - Sun Nov 1): 2 completions -> met.
  // Week of Oct 19: only 1 completion -> missed (breaks the run).
  const logs: HabitLog[] = mk([
    '2026-11-02', '2026-11-03', // current week
    '2026-10-27', '2026-10-29', // prior week
    '2026-10-21'                // two weeks ago (only 1)
  ]);

  const metrics = calculateHabitStreak(habit, logs, [], '2026-11-04');
  assert.equal(metrics.streakUnit, 'weeks');
  assert.equal(metrics.currentStreak, 2);
  assert.ok(metrics.longestStreak >= 2, 'longest successful-week run should be at least 2');
});

// ==========================================
// 14. SCHEMA MIGRATION (v1 -> v2)
// ==========================================
test('Migration: upgrades a legacy v1 payload to the current schema', () => {
  const legacy = {
    // no schemaVersion -> treated as v1
    habits: [
      {
        id: 'legacy-1',
        title: 'Old Habit',
        category: 'health',
        frequency: { type: 'daily' }, // legacy field name
        createdAt: '2026-09-01T00:00:00Z'
      },
      {
        // missing id -> a stable id is generated
        title: 'No ID Habit',
        schedule: { type: 'daily' }
      }
    ],
    logs: [{ id: 'l1', habitId: 'legacy-1', date: '2026-09-02', completed: true }],
    profile: { name: 'Sam' }
  };

  const migrated = migrateBackupPayload(legacy as unknown as Record<string, unknown>);

  assert.equal(migrated.schemaVersion, 2);
  assert.equal(migrated.habits.length, 2);
  // legacy `frequency` is mapped onto `schedule`
  assert.equal(migrated.habits[0].schedule.type, 'daily');
  // every habit ends up with a non-empty id
  assert.ok(migrated.habits.every((h) => typeof h.id === 'string' && h.id.length > 0));
  // profile defaults are merged with the incoming profile
  assert.equal(migrated.profile.name, 'Sam');
  assert.equal(migrated.profile.freezeAllowance, 3);
  assert.equal(migrated.logs.length, 1);
});

// ==========================================
// 15. MONTH-OVER-MONTH COMPARISON ZERO SAFEGUARD
// ==========================================
test('Analytics: month-over-month comparison is zero-safe with no habits', () => {
  const mom = calculateMonthOverMonthComparison([], [], [], '2026-11-04');
  assert.equal(mom.currentRate, 0);
  assert.equal(mom.previousRate, 0);
  assert.equal(mom.rateDelta, 0);
  assert.equal(mom.currentPeriodLabel, 'This Month (to date)');
  assert.equal(mom.previousPeriodLabel, 'Last Month (same days)');
  assert.equal(mom.currentHasData, false);
});

test('Analytics: month-over-month delta is expressed in percentage points', () => {
  const habit: Habit = {
    id: 'h-mom',
    title: 'Daily Task',
    category: 'productivity',
    schedule: { type: 'daily' },
    createdAt: '2026-09-01T00:00:00Z',
    updatedAt: '2026-09-01T00:00:00Z'
  };

  // October: 10 of 31 days completed. November 1-4: 4 of 4 completed.
  const logs: HabitLog[] = [];
  for (let d = 1; d <= 10; d++) {
    logs.push({ id: `oct-${d}`, habitId: 'h-mom', date: `2026-10-${String(d).padStart(2, '0')}`, completed: true });
  }
  for (let d = 1; d <= 4; d++) {
    logs.push({ id: `nov-${d}`, habitId: 'h-mom', date: `2026-11-${String(d).padStart(2, '0')}`, completed: true });
  }

  const mom = calculateMonthOverMonthComparison([habit], logs, [], '2026-11-04');
  // Delta is a straight subtraction of two rates (percentage points), never a
  // relative percent change.
  assert.equal(mom.rateDelta, mom.currentRate - mom.previousRate);
  assert.equal(typeof mom.rateDelta, 'number');
});

// ==========================================
// 16. ANALYTICS ENGINE — COUNTING UNIT & MATHEMATICAL CORRECTNESS (Stage 3)
// ==========================================

// Helper to build a simple daily habit created on a given date.
const dailyHabit = (id: string, category: Habit['category'], createdAt: string): Habit => ({
  id,
  title: id,
  category,
  schedule: { type: 'daily' },
  createdAt,
  updatedAt: createdAt
});

test('Analytics (1): 2 of 6 scheduled check-ins ≈ 33%', () => {
  const h = dailyHabit('h1', 'health', '2026-11-01T00:00:00Z');
  const dates = ['2026-11-01', '2026-11-02', '2026-11-03', '2026-11-04', '2026-11-05', '2026-11-06'];
  const logs: HabitLog[] = [
    { id: '1', habitId: 'h1', date: '2026-11-01', completed: true },
    { id: '2', habitId: 'h1', date: '2026-11-03', completed: true }
  ];
  const stats = calculateStatsForDates([h], logs, [], dates, '2026-11-06');
  assert.equal(stats.scheduled, 6); // counting unit is check-ins, not habits
  assert.equal(stats.completed, 2);
  assert.equal(stats.rate, 33); // round(2/6*100) = 33
  assert.equal(stats.hasData, true);
});

test('Analytics (2): 2 of 50 scheduled check-ins = 4%', () => {
  // 50 daily habits, one shared date -> 50 eligible check-ins, 2 completed.
  const habits: Habit[] = [];
  const logs: HabitLog[] = [];
  for (let i = 0; i < 50; i++) {
    habits.push(dailyHabit(`h${i}`, 'health', '2026-11-01T00:00:00Z'));
  }
  logs.push({ id: 'a', habitId: 'h0', date: '2026-11-05', completed: true });
  logs.push({ id: 'b', habitId: 'h1', date: '2026-11-05', completed: true });
  const stats = calculateStatsForDates(habits, logs, [], ['2026-11-05'], '2026-11-05');
  assert.equal(stats.scheduled, 50);
  assert.equal(stats.completed, 2);
  assert.equal(stats.rate, 4);
});

test('Analytics (3): previous 82% -> current 32% = -50pp', () => {
  // Build a WoW scenario: current week-to-date and previous same-days.
  // Reference 2026-11-04 is a Wednesday; Monday of that week is 2026-11-02.
  // elapsedDays = 3 (Mon, Tue, Wed). Previous window = 2026-10-26..2026-10-28.
  const habits: Habit[] = [];
  for (let i = 0; i < 50; i++) habits.push(dailyHabit(`c${i}`, 'health', '2026-10-01T00:00:00Z'));
  const logs: HabitLog[] = [];
  // Current window: 3 days * 50 = 150 check-ins. Complete 48 -> 32%.
  const curDays = ['2026-11-02', '2026-11-03', '2026-11-04'];
  let n = 0;
  for (const d of curDays) {
    for (let i = 0; i < 16; i++) {
      logs.push({ id: `cur-${n++}`, habitId: `c${(i + curDays.indexOf(d) * 16) % 50}`, date: d, completed: true });
    }
  }
  // Previous window: 3 days * 50 = 150 check-ins. Complete 123 -> 82%.
  const prevDays = ['2026-10-26', '2026-10-27', '2026-10-28'];
  let m = 0;
  for (const d of prevDays) {
    for (let i = 0; i < 41; i++) {
      logs.push({ id: `prev-${m++}`, habitId: `c${(i + prevDays.indexOf(d) * 9) % 50}`, date: d, completed: true });
    }
  }
  const wow = calculateWeekOverWeekComparison(habits, logs, [], '2026-11-04');
  assert.equal(wow.currentRate, 32);
  assert.equal(wow.previousRate, 82);
  assert.equal(wow.rateDelta, -50);
});

test('Analytics (4): previous 0% -> current 33% = +33pp', () => {
  const h = dailyHabit('h1', 'health', '2026-10-01T00:00:00Z');
  // Reference Wed 2026-11-04; window Mon 11-02..Wed 11-04 (3 check-ins).
  const logs: HabitLog[] = [{ id: '1', habitId: 'h1', date: '2026-11-02', completed: true }];
  const wow = calculateWeekOverWeekComparison([h], logs, [], '2026-11-04');
  assert.equal(wow.currentRate, 33); // 1/3
  assert.equal(wow.previousRate, 0); // nothing in prev window
  assert.equal(wow.rateDelta, 33);
});

test('Analytics (5): zero denominator reports no-data, not a misleading 0%', () => {
  const stats = calculateStatsForDates([], [], [], ['2026-11-04'], '2026-11-04');
  assert.equal(stats.scheduled, 0);
  assert.equal(stats.hasData, false);
  const overall = calculateOverallCompletionRate([], [], [], 30, '2026-11-04');
  assert.equal(overall.hasData, false);
});

test('Analytics (6): planned rest days are excluded from the denominator', () => {
  // specific_days Mon/Wed/Fri only. Reference Fri 2026-11-06.
  const h: Habit = {
    id: 'h1',
    title: 'Weekday',
    category: 'fitness',
    schedule: { type: 'specific_days', days: [1, 3, 5] },
    createdAt: '2026-11-01T00:00:00Z',
    updatedAt: '2026-11-01T00:00:00Z'
  };
  // Full week Mon 11-02 .. Sun 11-08. Only Mon/Wed/Fri are eligible -> 3.
  const dates = ['2026-11-02', '2026-11-03', '2026-11-04', '2026-11-05', '2026-11-06', '2026-11-07', '2026-11-08'];
  const logs: HabitLog[] = [{ id: '1', habitId: 'h1', date: '2026-11-04', completed: true }];
  const totals = computeHabitCheckins(h, dates, logs, [], '2026-11-06');
  // 11-06 is Friday (eligible). Window through ref 11-06: Mon,Wed,Fri = 3 eligible.
  assert.equal(totals.eligible, 3);
  assert.equal(totals.completed, 1);
});

test('Analytics (7): frozen days are excluded from numerator AND denominator', () => {
  const h = dailyHabit('h1', 'health', '2026-11-01T00:00:00Z');
  const dates = ['2026-11-02', '2026-11-03', '2026-11-04'];
  const freezes: StreakFreeze[] = [{ id: 'f1', date: '2026-11-03', reason: 'Sick', createdAt: '2026-11-03T00:00:00Z' }];
  const logs: HabitLog[] = [{ id: '1', habitId: 'h1', date: '2026-11-02', completed: true }];
  const totals = computeHabitCheckins(h, dates, logs, freezes, '2026-11-04');
  assert.equal(totals.eligible, 2); // 11-03 frozen, removed from denominator
  assert.equal(totals.completed, 1);
});

test('Analytics (8): missed (due but incomplete) check-ins stay in the denominator', () => {
  const h = dailyHabit('h1', 'health', '2026-11-01T00:00:00Z');
  const dates = ['2026-11-02', '2026-11-03', '2026-11-04'];
  const logs: HabitLog[] = [{ id: '1', habitId: 'h1', date: '2026-11-02', completed: true }];
  const stats = calculateStatsForDates([h], logs, [], dates, '2026-11-04');
  assert.equal(stats.scheduled, 3); // 2 missed days still count as eligible
  assert.equal(stats.completed, 1);
  assert.equal(stats.rate, 33);
});

test('Analytics (9): weekly-target habits use the quota, never 7 check-ins/week', () => {
  const h: Habit = {
    id: 'w1',
    title: 'Gym 3x',
    category: 'fitness',
    schedule: { type: 'times_per_week', targetCount: 3 },
    createdAt: '2026-11-01T00:00:00Z',
    updatedAt: '2026-11-01T00:00:00Z'
  };
  // A full week of dates but the quota caps eligibility at 3.
  const dates = ['2026-11-02', '2026-11-03', '2026-11-04', '2026-11-05', '2026-11-06', '2026-11-07', '2026-11-08'];
  const logs: HabitLog[] = [
    { id: '1', habitId: 'w1', date: '2026-11-02', completed: true },
    { id: '2', habitId: 'w1', date: '2026-11-04', completed: true },
    { id: '3', habitId: 'w1', date: '2026-11-06', completed: true },
    { id: '4', habitId: 'w1', date: '2026-11-07', completed: true } // exceeds quota
  ];
  const totals = computeHabitCheckins(h, dates, logs, [], '2026-11-08');
  assert.equal(totals.eligible, 3); // quota, not 7
  assert.equal(totals.completed, 3); // capped at quota -> never > 100%
});

test('Analytics (9b): weekly-target partial week clamps quota to elapsed days', () => {
  const h: Habit = {
    id: 'w1',
    title: 'Gym 3x',
    category: 'fitness',
    schedule: { type: 'times_per_week', targetCount: 3 },
    createdAt: '2026-11-01T00:00:00Z',
    updatedAt: '2026-11-01T00:00:00Z'
  };
  // Only Monday elapsed in the current week; future days excluded.
  const totals = computeHabitCheckins(h, ['2026-11-02', '2026-11-03'], [], [], '2026-11-02');
  assert.equal(totals.eligible, 1); // min(target 3, availableDays 1)
});

test('Analytics (10): categories use their own denominators', () => {
  const health = dailyHabit('hh', 'health', '2026-11-01T00:00:00Z');
  const fitness = dailyHabit('ff', 'fitness', '2026-11-01T00:00:00Z');
  const logs: HabitLog[] = [
    { id: '1', habitId: 'hh', date: '2026-11-02', completed: true },
    { id: '2', habitId: 'hh', date: '2026-11-03', completed: true },
    { id: '3', habitId: 'ff', date: '2026-11-02', completed: true }
  ];
  const breakdown = calculateCategoryBreakdown([health, fitness], logs, [], 2, '2026-11-03');
  const healthStat = breakdown.find((b) => b.category === 'health')!;
  const fitnessStat = breakdown.find((b) => b.category === 'fitness')!;
  assert.equal(healthStat.scheduledCount, 2);
  assert.equal(healthStat.completionRate, 100);
  assert.equal(fitnessStat.scheduledCount, 2);
  assert.equal(fitnessStat.completionRate, 50);
});

test('Analytics (11): overall rate is WEIGHTED by check-ins, not an average of category rates', () => {
  // health: 2 habits, 1 day -> 2 eligible, 2 completed (100%).
  // fitness: 1 habit, 1 day -> 1 eligible, 0 completed (0%).
  // Weighted overall = 2 completed / 3 eligible = 67%, NOT (100+0)/2 = 50%.
  const h1 = dailyHabit('h1', 'health', '2026-11-01T00:00:00Z');
  const h2 = dailyHabit('h2', 'health', '2026-11-01T00:00:00Z');
  const f1 = dailyHabit('f1', 'fitness', '2026-11-01T00:00:00Z');
  const logs: HabitLog[] = [
    { id: '1', habitId: 'h1', date: '2026-11-03', completed: true },
    { id: '2', habitId: 'h2', date: '2026-11-03', completed: true }
  ];
  const overall = calculateOverallCompletionRate([h1, h2, f1], logs, [], 1, '2026-11-03');
  assert.equal(overall.scheduled, 3);
  assert.equal(overall.completed, 2);
  assert.equal(overall.rate, 67);
});

test('Analytics (12): a category with zero eligible check-ins reports no data (scheduledCount 0)', () => {
  const health = dailyHabit('hh', 'health', '2026-11-01T00:00:00Z');
  const breakdown = calculateCategoryBreakdown([health], [], [], 1, '2026-11-03');
  const learning = breakdown.find((b) => b.category === 'learning')!;
  assert.equal(learning.scheduledCount, 0);
  assert.equal(learning.completionRate, 0);
  assert.equal(learning.activeCount, 0);
  // Best category ignores empty categories.
  const best = getBestPerformingCategory(breakdown);
  assert.equal(best?.category, 'health');
});

test('Analytics (13): previous-month comparison clamps when the prior month is shorter', () => {
  // Reference 2026-03-31. Previous month (Feb 2026) has 28 days -> clamp to 1..28.
  const h = dailyHabit('h1', 'health', '2026-01-01T00:00:00Z');
  const logs: HabitLog[] = [];
  for (let d = 1; d <= 28; d++) {
    logs.push({ id: `feb-${d}`, habitId: 'h1', date: `2026-02-${String(d).padStart(2, '0')}`, completed: true });
  }
  const mom = calculateMonthOverMonthComparison([h], logs, [], '2026-03-31');
  // Previous window is Feb 1..28 (clamped), all completed -> 100%.
  assert.equal(mom.previousScheduled, 28);
  assert.equal(mom.previousRate, 100);
  // Current window is Mar 1..31 with no logs -> 0% but has data.
  assert.equal(mom.currentScheduled, 31);
  assert.equal(mom.currentRate, 0);
  assert.equal(mom.rateDelta, -100);
});

test('Analytics (14): week boundaries are Monday-start and timezone-safe', () => {
  const h = dailyHabit('h1', 'health', '2026-10-01T00:00:00Z');
  // Reference Sunday 2026-11-08 -> Monday of that week is 2026-11-02, elapsedDays 7.
  const logs: HabitLog[] = [];
  for (let d = 2; d <= 8; d++) {
    logs.push({ id: `n-${d}`, habitId: 'h1', date: `2026-11-0${d}`, completed: true });
  }
  const wow = calculateWeekOverWeekComparison([h], logs, [], '2026-11-08');
  assert.equal(wow.currentScheduled, 7); // full Mon..Sun week-to-date
  assert.equal(wow.currentCompleted, 7);
  assert.equal(wow.currentRate, 100);
  // Previous window is 2026-10-26..2026-11-01 (7 days), no completions there.
  assert.equal(wow.previousScheduled, 7);
  assert.equal(wow.previousRate, 0);
});

