import {
  afterNextRender,
  Component,
  computed,
  ElementRef,
  inject,
  Injector,
  input,
  linkedSignal,
  output,
  signal,
  untracked,
} from '@angular/core';
import { faChevronLeft, faChevronRight } from '@awesome.me/kit-0b6d1ed528/icons/classic/regular';
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  parseISO,
  startOfMonth,
  startOfWeek,
} from 'date-fns';
import { de } from 'date-fns/locale';

import { I18nPipe, I18nService } from '@/shared/i18n';
import { ButtonComponent, ButtonSize, ButtonVariants } from '@/shared/ui/button';

import {
  CalendarDay,
  DAYS_PER_WEEK,
  ISO_FORMAT,
  LOCALES,
  MAX_ISO,
  MIN_ISO,
  moveTarget,
  WEEK_OPTIONS,
} from '../agridata-datepicker.model';

/**
 * Month grid of the datepicker. Shows the month of `value` (else `min`, else today) and focuses
 * the selected or first pickable day when it appears. Arrow keys, Home/End and PageUp/PageDown move
 * between days, days before `min` or after 2999 cannot be picked.
 *
 * CommentLastReviewed: 2026-11-16
 */
@Component({
  selector: 'app-agridata-datepicker-calendar',
  imports: [ButtonComponent, I18nPipe],
  templateUrl: './agridata-datepicker-calendar.component.html',
})
export class AgridataDatepickerCalendarComponent {
  // Injects
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly i18nService = inject(I18nService);
  private readonly injector = inject(Injector);

  // Constants
  protected readonly ButtonSize = ButtonSize;
  protected readonly ButtonVariants = ButtonVariants;
  protected readonly chevronLeft = faChevronLeft;
  protected readonly chevronRight = faChevronRight;

  // Input properties
  /** Earliest selectable day as `yyyy-MM-dd`. */
  readonly min = input<string | null>(null);
  /** Selected day as `yyyy-MM-dd`, `''` for none. */
  readonly value = input<string>('');

  // Output properties
  readonly handleSelect = output<string>();

  // Signals
  protected readonly focusedIso = signal<string | undefined>(undefined);
  /** Set once when the calendar opens (untracked), later changes of `value` or `min` keep the month. */
  private readonly viewMonth = linkedSignal(() =>
    untracked(() => {
      const start = this.value() || this.min();
      return startOfMonth(start ? parseISO(start) : new Date());
    }),
  );

  // Computed Signals
  protected readonly days = computed<CalendarDay[]>(() => {
    const month = this.viewMonth();
    const locale = this.locale();
    const selected = this.value();
    const today = new Date();
    return eachDayOfInterval({
      start: startOfWeek(startOfMonth(month), WEEK_OPTIONS),
      end: endOfWeek(endOfMonth(month), WEEK_OPTIONS),
    }).map((date) => {
      const iso = format(date, ISO_FORMAT);
      return {
        date,
        disabled: this.isOutOfRange(iso),
        inMonth: date.getMonth() === month.getMonth(),
        iso,
        isSelected: iso === selected,
        isToday: isSameDay(date, today),
        label: format(date, 'PPPP', { locale }),
        number: format(date, 'd'),
      };
    });
  });

  /** The one day that is a tab stop (roving tabindex): the focused day, else selected, else first pickable. */
  protected readonly focusableIso = computed(() => {
    const inMonth = this.days().filter((day) => day.inMonth);
    const focused = inMonth.find((day) => day.iso === this.focusedIso());
    const selected = inMonth.find((day) => day.isSelected);
    const firstPickable = inMonth.find((day) => !day.disabled);
    return (focused ?? selected ?? firstPickable)?.iso;
  });

  /** No month after December 2999 can be shown. */
  protected readonly isNextMonthDisabled = computed(
    () => format(addMonths(this.viewMonth(), 1), ISO_FORMAT) > MAX_ISO,
  );

  /** No month that ends before the earliest selectable day can be shown. */
  protected readonly isPrevMonthDisabled = computed(() =>
    this.isBeforeMin(format(endOfMonth(addMonths(this.viewMonth(), -1)), ISO_FORMAT)),
  );

  /** Today is not pickable when it lies before `min`, so jumping to it makes no sense. */
  protected readonly isTodayDisabled = computed(() =>
    this.isBeforeMin(format(new Date(), ISO_FORMAT)),
  );

  protected readonly monthLabel = computed(() =>
    format(this.viewMonth(), 'LLLL yyyy', { locale: this.locale() }),
  );

  protected readonly weekdays = computed(() =>
    this.days()
      .slice(0, DAYS_PER_WEEK)
      .map((day) => ({
        full: format(day.date, 'EEEE', { locale: this.locale() }),
        short: format(day.date, 'EEEEEE', { locale: this.locale() }),
      })),
  );

  protected readonly weeks = computed(() => {
    const days = this.days();
    return Array.from({ length: days.length / DAYS_PER_WEEK }, (_, week) =>
      days.slice(week * DAYS_PER_WEEK, (week + 1) * DAYS_PER_WEEK),
    );
  });

  private readonly locale = computed(() => LOCALES[this.i18nService.lang()] ?? de);

  // Effects
  /** The calendar is created on every open, so focus moves into it right away. */
  private readonly focusOnOpen = afterNextRender(() => this.focusDay(this.focusableIso()));

  protected goToToday(): void {
    const today = new Date();
    this.viewMonth.set(startOfMonth(today));
    this.focusDay(format(today, ISO_FORMAT));
  }

  protected handleDayKeydown(event: KeyboardEvent, day: CalendarDay): void {
    const target = moveTarget(event, day.date);
    if (!target) return;
    event.preventDefault();
    const iso = format(target, ISO_FORMAT);
    if (this.isOutOfRange(iso)) return;
    this.viewMonth.set(startOfMonth(target));
    this.focusDay(iso);
  }

  protected showMonth(offset: number): void {
    this.viewMonth.update((month) => addMonths(month, offset));
  }

  private focusDay(iso: string | undefined): void {
    if (!iso) return;
    afterNextRender(
      () => this.host.nativeElement.querySelector<HTMLElement>(`[data-date="${iso}"]`)?.focus(),
      { injector: this.injector },
    );
  }

  private isBeforeMin(iso: string): boolean {
    const min = this.min();
    return iso < (min && min > MIN_ISO ? min : MIN_ISO);
  }

  private isOutOfRange(iso: string): boolean {
    return this.isBeforeMin(iso) || iso > MAX_ISO;
  }
}
