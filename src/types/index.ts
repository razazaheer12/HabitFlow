/**
 * Domain and Application Data Models for HabitFlow
 * Strictly typed, schema-versioned models for local-first persistence
 */

export const CURRENT_SCHEMA_VERSION = 2;

export type HabitCategory = 'fitness' | 'mind' | 'productivity' | 'learning' | 'health';

export interface CategoryInfo {
  id: HabitCategory;
  name: string;
  color: string;
  icon: string;
  description: string;
}

export const CATEGORIES: Record<HabitCategory, CategoryInfo> = {
  fitness: {
    id: 'fitness',
    name: 'Fitness / Body',
    color: 'text-amber-400',
    icon: 'Dumbbell',
    description: 'Workouts, physical movement, stretching & vitality'
  },
  mind: {
    id: 'mind',
    name: 'Mind & Focus',
    color: 'text-sky-400',
    icon: 'Brain',
    description: 'Meditation, breathwork, journaling & clarity'
  },
  productivity: {
    id: 'productivity',
    name: 'Productivity',
    color: 'text-emerald-400',
    icon: 'Zap',
    description: 'Deep work, organization, inbox zero & execution'
  },
  learning: {
    id: 'learning',
    name: 'Learning',
    color: 'text-indigo-400',
    icon: 'BookOpen',
    description: 'Reading, languages, coding, instrument practice'
  },
  health: {
    id: 'health',
    name: 'Health & Routine',
    color: 'text-rose-400',
    icon: 'HeartPulse',
    description: 'Hydration, sleep schedule, nutrition & wellness'
  }
};

export type ScheduleType = 'daily' | 'specific_days' | 'times_per_week';

export interface HabitSchedule {
  type: ScheduleType;
  /** 0 = Sun, 1 = Mon, 2 = Tue, ..., 6 = Sat */
  days?: number[];
  /** target completions per calendar week (1 to 7) */
  targetCount?: number;
}

export interface ScheduleHistoryEntry {
  effectiveFrom: string; // "YYYY-MM-DD"
  schedule: HabitSchedule;
}

export interface Habit {
  id: string;
  title: string;
  category: HabitCategory;
  schedule: HabitSchedule;
  scheduleHistory?: ScheduleHistoryEntry[]; // Historical schedule revisions
  /** "YYYY-MM-DD" date from which the current schedule is effective. Defaults to createdAt date when absent. */
  scheduleEffectiveFrom?: string;
  targetUnit?: string; // e.g. "30 mins", "10 pages", "2.5 liters"
  reminderTime?: string; // "HH:MM" in 24h local time (e.g. "07:30")
  notes?: string; // baseline cue / motivation
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
  archived?: boolean; // archived habits preserve historical logs
  archivedAt?: string;
}

export interface HabitLog {
  id: string;
  habitId: string;
  date: string; // "YYYY-MM-DD" local calendar date
  completed: boolean;
  completedAt?: string; // ISO string
}

export interface JournalNote {
  id: string;
  habitId: string;
  date: string; // "YYYY-MM-DD" local calendar date
  note: string; // 1-line reflection
  createdAt: string;
  updatedAt: string;
}

export interface StreakFreeze {
  id: string;
  date: string; // "YYYY-MM-DD" local calendar date
  habitId?: string; // if undefined, applies to all habits (Holiday Mode)
  reason: string; // e.g. "Sick / Recovery", "Travel / Vacation", "Holiday Mode"
  createdAt: string;
}

export interface UserProfile {
  name: string;
  age?: number | ''; // Optional! No date of birth collected
  onboardingCompleted: boolean;
  theme: 'dark' | 'light' | 'system';
  freezeAllowance: number; // default: 3 per month
  soundEnabled: boolean;
  notificationsEnabled: boolean;
  notificationDisclaimerAcknowledged?: boolean;
}

/**
 * 4 Distinguishable Daily Execution Statuses
 */
export type DailyStatus = 'completed' | 'frozen' | 'skipped' | 'missed';

export interface HabitDayState {
  habit: Habit;
  date: string;
  isScheduled: boolean;
  status: DailyStatus;
  isCompleted: boolean;
  isFrozen: boolean;
  isRestDay: boolean;
  note?: JournalNote;
  streak: number;
}

export interface HeatmapDay {
  date: string;
  completedCount: number;
  eligibleCount: number;
  percentage: number;
  isFrozen: boolean;
  intensity: 0 | 1 | 2 | 3 | 4;
}

export interface CategoryStat {
  category: HabitCategory;
  name: string;
  activeCount: number;
  completedCount: number;
  scheduledCount: number;
  completionRate: number;
}

export interface PeriodComparisonStat {
  currentPeriodLabel: string;
  previousPeriodLabel: string;
  currentCompleted: number;
  currentScheduled: number;
  currentRate: number;
  previousCompleted: number;
  previousScheduled: number;
  previousRate: number;
  rateDelta: number; // percentage points difference (+12%, -5%)
}

export interface BackupPayload {
  schemaVersion: number;
  exportedAt: string;
  appVersion: string;
  profile: UserProfile;
  habits: Habit[];
  logs: HabitLog[];
  notes: JournalNote[];
  freezes: StreakFreeze[];
}

export interface BackupValidationResult {
  valid: boolean;
  error?: string;
  summary?: {
    habitsCount: number;
    logsCount: number;
    notesCount: number;
    freezesCount: number;
    userName: string;
    schemaVersion: number;
  };
}
