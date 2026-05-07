import { ItemView, WorkspaceLeaf } from 'obsidian';
import type TraceMindPlugin from '../main';
import {
  formatCalendarDate, getMonthDays, getNextMonth, getPrevMonth,
  buildDiaryDateSet, buildDayAriaLabel,
} from './calendar-utils';

export const VIEW_TYPE_CALENDAR = 'tracemind-calendar';

export class CalendarView extends ItemView {
  private plugin: TraceMindPlugin;
  private currentYear: number;
  private currentMonth: number;
  private onDateClickCallback: ((date: Date) => void) | null = null;

  constructor(leaf: WorkspaceLeaf, plugin: TraceMindPlugin) {
    super(leaf);
    this.plugin = plugin;
    const now = new Date();
    this.currentYear = now.getFullYear();
    this.currentMonth = now.getMonth();
  }

  getViewType() { return VIEW_TYPE_CALENDAR; }
  getDisplayText() { return '日历'; }
  getIcon() { return 'calendar'; }

  async onOpen() { this.renderCalendar(); }

  setOnDateClick(cb: (date: Date) => void) { this.onDateClickCallback = cb; }

  handleDateClick(date: Date) {
    if (this.onDateClickCallback) this.onDateClickCallback(date);
  }

  isToday(date: Date) {
    const t = new Date();
    return date.getFullYear() === t.getFullYear() && date.getMonth() === t.getMonth() && date.getDate() === t.getDate();
  }

  isCurrentMonth(date: Date) {
    return date.getFullYear() === this.currentYear && date.getMonth() === this.currentMonth;
  }

  diaryExists(dateStr: string) {
    try {
      return this.app.vault.getAbstractFileByPath(`Daily/${dateStr}.md`) != null;
    } catch { return false; }
  }

  goNext() {
    const n = getNextMonth(this.currentYear, this.currentMonth);
    this.currentYear = n.year; this.currentMonth = n.month;
    this.renderCalendar();
  }

  goPrev() {
    const p = getPrevMonth(this.currentYear, this.currentMonth);
    this.currentYear = p.year; this.currentMonth = p.month;
    this.renderCalendar();
  }

  goToday() {
    const t = new Date();
    this.currentYear = t.getFullYear(); this.currentMonth = t.getMonth();
    this.renderCalendar();
  }

  private async renderCalendar() {
    const c = this.containerEl; c.empty(); this.addStyles();

    const cal = c.createEl('div', { cls: 'tracemind-calendar' });
    this.renderHeader(cal);
    this.renderWeekdays(cal);
    await this.renderDays(cal);
  }

  private renderHeader(cal: HTMLElement) {
    const h = cal.createEl('div', { cls: 'lifewiki-calendar-header' });

    const prev = h.createEl('button', { cls: 'lifewiki-calendar-nav-btn', text: '‹' });
    prev.setAttr('title', '上个月'); prev.setAttr('aria-label', '上个月');
    prev.addEventListener('click', () => this.goPrev());

    const title = h.createEl('span', { cls: 'lifewiki-calendar-title', text: this.monthTitle() });
    title.setAttr('title', '回到今天'); title.setAttr('aria-label', '回到今天');
    title.addEventListener('click', () => this.goToday());

    const next = h.createEl('button', { cls: 'lifewiki-calendar-nav-btn', text: '›' });
    next.setAttr('title', '下个月'); next.setAttr('aria-label', '下个月');
    next.addEventListener('click', () => this.goNext());
  }

  private renderWeekdays(cal: HTMLElement) {
    const w = cal.createEl('div', { cls: 'lifewiki-calendar-weekdays' });
    for (const d of ['日','一','二','三','四','五','六']) w.createEl('div', { cls: 'lifewiki-calendar-weekday', text: d });
  }

  private async renderDays(cal: HTMLElement) {
    const days = getMonthDays(this.currentYear, this.currentMonth);
    // Batch: compute diary existence once for all days
    const diarySet = buildDiaryDateSet(days, ds => this.diaryExists(ds));

    const grid = cal.createEl('div', { cls: 'lifewiki-calendar-grid' });
    for (const date of days) {
      const ds = formatCalendarDate(date);
      const hasDiary = diarySet.has(ds);
      const isCurrent = this.isCurrentMonth(date);
      const isToday = this.isToday(date);

      const dayEl = grid.createEl('div', { cls: 'lifewiki-calendar-day' });
      if (!isCurrent) dayEl.addClass('lifewiki-calendar-day-other-month');
      if (isToday) dayEl.addClass('lifewiki-calendar-day-today');
      if (hasDiary) dayEl.addClass('lifewiki-calendar-day-has-diary');

      const label = buildDayAriaLabel(date, { isToday, hasDiary, isCurrentMonth: isCurrent });
      dayEl.setAttr('role', 'button');
      dayEl.setAttr('tabindex', '0');
      dayEl.setAttr('title', label);
      dayEl.setAttr('aria-label', label);

      dayEl.createEl('span', { cls: 'lifewiki-calendar-day-num', text: String(date.getDate()) });

      const handle = () => this.handleDateClick(date);
      dayEl.addEventListener('click', handle);
      dayEl.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handle(); }
      });
    }
  }

  private monthTitle() {
    const names = ['一月','二月','三月','四月','五月','六月','七月','八月','九月','十月','十一月','十二月'];
    return `${this.currentYear}年 ${names[this.currentMonth]}`;
  }

  private addStyles() {
    if (document.getElementById('lifewiki-calendar-styles')) return;
    const s = document.createElement('style');
    s.id = 'lifewiki-calendar-styles';
    s.textContent = `
.tracemind-calendar{padding:12px;height:100%;display:flex;flex-direction:column;background:var(--background-primary)}
.lifewiki-calendar-header{display:flex;justify-content:space-between;align-items:center;padding:8px 0;margin-bottom:8px}
.lifewiki-calendar-title{font-size:16px;font-weight:600;cursor:pointer}
.lifewiki-calendar-nav-btn{background:none;border:none;font-size:20px;cursor:pointer;padding:4px 12px;color:var(--text-muted);border-radius:4px}
.lifewiki-calendar-nav-btn:hover{background:var(--background-secondary);color:var(--text-normal)}
.lifewiki-calendar-weekdays{display:grid;grid-template-columns:repeat(7,1fr);text-align:center;margin-bottom:4px}
.lifewiki-calendar-weekday{font-size:12px;color:var(--text-muted);padding:4px}
.lifewiki-calendar-grid{display:grid;grid-template-columns:repeat(7,1fr);gap:.5px;max-height:33vh;overflow:auto}
.lifewiki-calendar-day{display:flex;align-items:center;justify-content:center;cursor:pointer;border-radius:4px;min-height:24px;padding:2px;position:relative}
.lifewiki-calendar-day:hover{background:var(--background-secondary)}
.lifewiki-calendar-day-num{font-size:11px}
.lifewiki-calendar-day-today .lifewiki-calendar-day-num{background:var(--interactive-accent);color:var(--text-on-accent);width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:600}
.lifewiki-calendar-day-has-diary::after{content:'';position:absolute;bottom:4px;width:4px;height:4px;border-radius:50%;background:var(--interactive-accent)}
.lifewiki-calendar-day-other-month{opacity:.3}
`;
    document.head.appendChild(s);
  }
}

export function createCalendarView(leaf: WorkspaceLeaf, plugin: TraceMindPlugin) {
  return new CalendarView(leaf, plugin);
}
