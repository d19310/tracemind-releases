export interface DiaryChecker {
  (dateStr: string): boolean;
}

export function formatCalendarDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function getMonthDays(year: number, month: number): Date[] {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const days: Date[] = [];

  const startDow = firstDay.getDay();
  for (let i = startDow - 1; i >= 0; i--) {
    days.push(new Date(year, month, -i));
  }
  for (let d = 1; d <= lastDay.getDate(); d++) {
    days.push(new Date(year, month, d));
  }
  const remaining = 42 - days.length;
  for (let i = 1; i <= remaining; i++) {
    days.push(new Date(year, month + 1, i));
  }
  return days;
}

export function getNextMonth(year: number, month: number): { year: number; month: number } {
  return month === 11 ? { year: year + 1, month: 0 } : { year, month: month + 1 };
}

export function getPrevMonth(year: number, month: number): { year: number; month: number } {
  return month === 0 ? { year: year - 1, month: 11 } : { year, month: month - 1 };
}

export function buildDiaryDateSet(days: Date[], checker: DiaryChecker): Set<string> {
  const set = new Set<string>();
  for (const d of days) {
    const ds = formatCalendarDate(d);
    if (checker(ds)) set.add(ds);
  }
  return set;
}

export function buildDayAriaLabel(date: Date, opts: {
  isToday: boolean;
  hasDiary: boolean;
  isCurrentMonth: boolean;
}): string {
  const ds = formatCalendarDate(date);
  const parts = [ds];
  if (opts.isToday) parts.push('今天');
  parts.push(opts.hasDiary ? '有日记' : '无日记');
  if (!opts.isCurrentMonth) parts.push('非当前月');
  return parts.join(' · ');
}
