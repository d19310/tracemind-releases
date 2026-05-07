import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  formatCalendarDate, getMonthDays, getNextMonth, getPrevMonth,
  buildDiaryDateSet, buildDayAriaLabel,
} from '../../src/views/calendar-utils';

describe('formatCalendarDate', () => {
  it('formats as YYYY-MM-DD', () => {
    assert.equal(formatCalendarDate(new Date(2026, 4, 7)), '2026-05-07');
    assert.equal(formatCalendarDate(new Date(2026, 11, 31)), '2026-12-31');
  });
});

describe('getMonthDays', () => {
  it('returns exactly 42 days', () => {
    const days = getMonthDays(2026, 4); // May 2026
    assert.equal(days.length, 42);
  });

  it('first days may be from previous month', () => {
    const days = getMonthDays(2026, 4);
    // May 1 2026 is Friday (dow 5), so first 5 days should be April
    assert.equal(days[5].getDate(), 1); // May 1 is at index 5
    assert.equal(days[5].getMonth(), 4);
    assert.equal(days[0].getMonth(), 3); // April
  });

  it('last days may be from next month', () => {
    const days = getMonthDays(2026, 4);
    // May 31 + remaining → June dates at the end
    const last = days[41];
    assert.ok(last.getMonth() >= 4); // May or June
  });
});

describe('getNextMonth / getPrevMonth', () => {
  it('next from December wraps to January next year', () => {
    const n = getNextMonth(2026, 11);
    assert.equal(n.year, 2027);
    assert.equal(n.month, 0);
  });

  it('prev from January wraps to December previous year', () => {
    const p = getPrevMonth(2026, 0);
    assert.equal(p.year, 2025);
    assert.equal(p.month, 11);
  });

  it('next within same year', () => {
    const n = getNextMonth(2026, 5);
    assert.equal(n.year, 2026);
    assert.equal(n.month, 6);
  });
});

describe('buildDiaryDateSet', () => {
  it('returns set with existing dates only', () => {
    const days = [new Date(2026, 4, 7), new Date(2026, 4, 8)];
    const checker = (ds: string) => ds === '2026-05-07';
    const set = buildDiaryDateSet(days, checker);
    assert.equal(set.size, 1);
    assert.ok(set.has('2026-05-07'));
    assert.ok(!set.has('2026-05-08'));
  });

  it('returns empty set when no diaries exist', () => {
    const days = [new Date(2026, 4, 7)];
    const set = buildDiaryDateSet(days, () => false);
    assert.equal(set.size, 0);
  });
});

describe('buildDayAriaLabel', () => {
  const d = new Date(2026, 4, 7);

  it('includes date and diary status', () => {
    const label = buildDayAriaLabel(d, { isToday: false, hasDiary: true, isCurrentMonth: true });
    assert.ok(label.includes('2026-05-07'));
    assert.ok(label.includes('有日记'));
  });

  it('shows today marker', () => {
    const label = buildDayAriaLabel(d, { isToday: true, hasDiary: false, isCurrentMonth: true });
    assert.ok(label.includes('今天'));
    assert.ok(label.includes('无日记'));
  });

  it('shows other month marker', () => {
    const label = buildDayAriaLabel(d, { isToday: false, hasDiary: false, isCurrentMonth: false });
    assert.ok(label.includes('非当前月'));
  });
});

