/**
 * Calendar View
 * Monthly calendar with date indicators for diary entries.
 * Click a date to navigate to that day's diary.
 */

import { ItemView, WorkspaceLeaf, setIcon } from 'obsidian';

export const VIEW_TYPE_CALENDAR = 'tracemind-calendar';

interface MonthInfo {
  year: number;
  month: number; // 0-indexed
}

type DateClickCallback = (date: Date) => void;

const WEEKDAYS = ['日', '一', '二', '三', '四', '五', '六'];
const MONTH_NAMES = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];

export class CalendarView extends ItemView {
  private currentMonth: MonthInfo;
  private onDateClickCallback: DateClickCallback | null = null;
  private calendarContainerEl: HTMLElement | null = null;
  // Dates that have diary entries (YYYY-MM-DD -> true)
  private diaryDates: Set<string> = new Set();

  constructor(leaf: WorkspaceLeaf) {
    super(leaf);
    const now = new Date();
    this.currentMonth = { year: now.getFullYear(), month: now.getMonth() };
  }

  getViewType(): string {
    return VIEW_TYPE_CALENDAR;
  }

  getDisplayText(): string {
    return '日历';
  }

  getIcon(): string {
    return 'calendar';
  }

  async onOpen() {
    const container = this.containerEl.children[1] as HTMLElement;
    container.empty();
    this.calendarContainerEl = container;
    this.renderCalendar();
  }

  async onClose() {
    this.calendarContainerEl = null;
  }

  /**
   * Set date click callback
   */
  setOnDateClick(callback: DateClickCallback): void {
    this.onDateClickCallback = callback;
  }

  /**
   * Set which dates have diary entries
   */
  setDiaryDates(dates: string[]): void {
    this.diaryDates = new Set(dates);
    this.renderCalendar();
  }

  /**
   * Navigate to a specific month
   */
  navigateTo(year: number, month: number): void {
    this.currentMonth = { year, month };
    this.renderCalendar();
  }

  /**
   * Handle date click
   */
  private handleDateClick(date: Date): void {
    if (this.onDateClickCallback) {
      this.onDateClickCallback(date);
    }
  }

  /**
   * Get all dates for a month (including padding from prev/next months)
   */
  private getMonthDays(year: number, month: number): Date[] {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days: Date[] = [];

    const startDayOfWeek = firstDay.getDay();
    // Previous month padding
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      days.push(new Date(year, month, -i));
    }
    // Current month
    for (let d = 1; d <= lastDay.getDate(); d++) {
      days.push(new Date(year, month, d));
    }
    // Next month padding (6 weeks total)
    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
      days.push(new Date(year, month + 1, i));
    }
    return days;
  }

  /**
   * Format date as YYYY-MM-DD
   */
  private formatDateKey(date: Date): string {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  }

  /**
   * Check if date is today
   */
  private isToday(date: Date): boolean {
    const now = new Date();
    return date.getFullYear() === now.getFullYear() &&
           date.getMonth() === now.getMonth() &&
           date.getDate() === now.getDate();
  }

  /**
   * Render the calendar UI
   */
  private renderCalendar(): void {
    if (!this.calendarContainerEl) return;
    this.calendarContainerEl.empty();

    const { year, month } = this.currentMonth;
    const today = new Date();

    // Header with month/year and nav buttons
    const header = this.containerEl.createEl('div', { cls: 'tracemind-calendar-header' });

    const prevBtn = header.createEl('button', { cls: 'tracemind-calendar-nav-btn' });
    setIcon(prevBtn, 'chevron-left');
    prevBtn.addEventListener('click', () => {
      const newMonth = month === 0 ? 11 : month - 1;
      const newYear = month === 0 ? year - 1 : year;
      this.navigateTo(newYear, newMonth);
    });

    header.createEl('span', {
      text: `${year}年 ${MONTH_NAMES[month]}`,
      cls: 'tracemind-calendar-title',
    });

    const nextBtn = header.createEl('button', { cls: 'tracemind-calendar-nav-btn' });
    setIcon(nextBtn, 'chevron-right');
    nextBtn.addEventListener('click', () => {
      const newMonth = month === 11 ? 0 : month + 1;
      const newYear = month === 11 ? year + 1 : year;
      this.navigateTo(newYear, newMonth);
    });

    // Today button
    const todayBtn = header.createEl('button', {
      text: '今天',
      cls: 'tracemind-calendar-today-btn',
    });
    todayBtn.addEventListener('click', () => {
      this.navigateTo(today.getFullYear(), today.getMonth());
    });

    // Weekday headers
    const weekdayRow = this.containerEl.createEl('div', { cls: 'tracemind-calendar-weekdays' });
    for (const day of WEEKDAYS) {
      weekdayRow.createEl('span', { text: day, cls: 'tracemind-calendar-weekday' });
    }

    // Calendar grid
    const grid = this.containerEl.createEl('div', { cls: 'tracemind-calendar-grid' });
    const days = this.getMonthDays(year, month);

    for (const date of days) {
      const dayEl = grid.createEl('div', {
        text: String(date.getDate()),
        cls: 'tracemind-calendar-day',
      });

      const key = this.formatDateKey(date);
      const isCurrentMonth = date.getMonth() === month;
      const isDiaryDay = this.diaryDates.has(key);

      if (!isCurrentMonth) {
        dayEl.classList.add('tracemind-calendar-day-other-month');
      }
      if (this.isToday(date)) {
        dayEl.classList.add('tracemind-calendar-day-today');
      }
      if (isDiaryDay) {
        dayEl.classList.add('tracemind-calendar-day-has-diary');
      }

      dayEl.addEventListener('click', () => {
        this.handleDateClick(date);
      });
    }
  }
}
