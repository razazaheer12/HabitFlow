/**
 * Local-First Timezone-Safe Date Utilities
 * Never slices UTC ISO strings; always queries the device's local calendar components.
 */

/**
 * Returns a YYYY-MM-DD local calendar date string from a Date object
 */
export function toLocalDateString(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Parses a YYYY-MM-DD string into a Date safely anchored at noon local time
 * (Noon prevents DST midnight boundary jumps)
 */
export function fromLocalDateString(dateStr: string): Date {
  const parts = dateStr.split('-').map(Number);
  const year = parts[0] || 2026;
  const month = (parts[1] || 1) - 1;
  const day = parts[2] || 1;
  return new Date(year, month, day, 12, 0, 0, 0);
}

/**
 * Shifts a YYYY-MM-DD string by N calendar days safely in local time
 */
export function shiftDate(dateStr: string, daysDelta: number): string {
  const d = fromLocalDateString(dateStr);
  d.setDate(d.getDate() + daysDelta);
  return toLocalDateString(d);
}

/**
 * Dynamic greeting based on current local time
 */
export function getLocalGreeting(date: Date = new Date()): {
  greeting: string;
  subtext: string;
  period: 'morning' | 'afternoon' | 'evening';
} {
  const hour = date.getHours();
  if (hour >= 5 && hour < 12) {
    return {
      greeting: 'Good Morning',
      subtext: 'Build momentum with your first win today',
      period: 'morning'
    };
  } else if (hour >= 12 && hour < 18) {
    return {
      greeting: 'Good Afternoon',
      subtext: 'Stay steady and keep your focus sharp',
      period: 'afternoon'
    };
  } else {
    return {
      greeting: 'Good Evening',
      subtext: 'Reflect, check off progress and recharge',
      period: 'evening'
    };
  }
}

export const getGreeting = getLocalGreeting;

/**
 * Formats a local date using Intl.DateTimeFormat
 */
export function formatDisplayDate(
  dateStr: string,
  options: { includeYear?: boolean; short?: boolean } = {}
): string {
  const target = fromLocalDateString(dateStr);
  const today = toLocalDateString();
  const yesterday = shiftDate(today, -1);
  const tomorrow = shiftDate(today, 1);

  if (!options.includeYear) {
    if (dateStr === today) return 'Today';
    if (dateStr === yesterday) return 'Yesterday';
    if (dateStr === tomorrow) return 'Tomorrow';
  }

  const formatter = new Intl.DateTimeFormat(undefined, {
    weekday: options.short ? 'short' : 'long',
    month: options.short ? 'short' : 'long',
    day: 'numeric',
    year: options.includeYear ? 'numeric' : undefined
  });

  return formatter.format(target);
}

/**
 * Returns Monday-start calendar week dates for a given date
 */
export function getCalendarWeekDates(dateStr: string): string[] {
  const d = fromLocalDateString(dateStr);
  const dayOfWeek = d.getDay(); // 0 = Sun, 1 = Mon ... 6 = Sat
  // Distance to Monday (1): if Sunday (0), distance is -6; otherwise 1 - dayOfWeek
  const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const mondayStr = shiftDate(dateStr, diffToMonday);

  const weekDates: string[] = [];
  for (let i = 0; i < 7; i++) {
    weekDates.push(shiftDate(mondayStr, i));
  }
  return weekDates;
}

/**
 * Returns a stable key identifying the calendar week (e.g. "2026-W45")
 */
export function getCalendarWeekKey(dateStr: string): string {
  const d = fromLocalDateString(dateStr);
  // ISO week calculation using Thursday
  const thursday = new Date(d.getTime());
  thursday.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7));
  const firstThursday = new Date(thursday.getFullYear(), 0, 4);
  const weekNum = 1 + Math.round(((thursday.getTime() - firstThursday.getTime()) / 86400000 - 3 + ((firstThursday.getDay() + 6) % 7)) / 7);
  return `${thursday.getFullYear()}-W${String(weekNum).padStart(2, '0')}`;
}

/**
 * Generates an array of past N dates ending on reference date (inclusive)
 */
export function getPastDates(daysCount: number, endDateStr: string = toLocalDateString()): string[] {
  const dates: string[] = [];
  for (let i = daysCount - 1; i >= 0; i--) {
    dates.push(shiftDate(endDateStr, -i));
  }
  return dates;
}
