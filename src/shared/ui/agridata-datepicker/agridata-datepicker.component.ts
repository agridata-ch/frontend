import {
  afterNextRender,
  Component,
  computed,
  effect,
  ElementRef,
  inject,
  Injector,
  input,
  linkedSignal,
  signal,
  viewChild,
} from '@angular/core';
import { ReactiveFormsModule, ValidatorFn } from '@angular/forms';
import { faCalendar } from '@awesome.me/kit-0b6d1ed528/icons/classic/light';
import { faChevronLeft, faChevronRight } from '@awesome.me/kit-0b6d1ed528/icons/classic/regular';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  addDays,
  addMonths,
  addYears,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isValid,
  Locale,
  parse,
  parseISO,
  startOfMonth,
  startOfWeek,
} from 'date-fns';
import { de, fr, it } from 'date-fns/locale';

import { ClickOutsideDirective } from '@/shared/click-outside/click-outside.directive';
import { formatDate } from '@/shared/date';
import { I18nPipe, I18nService } from '@/shared/i18n';
import { FormControlWithMessages } from '@/shared/lib/form.helper';
import { ButtonComponent, ButtonSize, ButtonVariants } from '@/shared/ui/button';
import { createOpenAboveSignal } from '@/shared/utils';

const ISO_FORMAT = 'yyyy-MM-dd';
const MIN_YEAR = 1900;
const MAX_YEAR = 2999;
const MIN_ISO = `${MIN_YEAR}-01-01`;
const MAX_ISO = `${MAX_YEAR}-12-31`;
const TYPED_PATTERN = /^\d{1,2}\.\d{1,2}\.\d{4}$/;
const LOCALES: Record<string, Locale> = { de, fr, it };
const WEEK_OPTIONS = { weekStartsOn: 1 } as const;
const DAYS_PER_WEEK = 7;
const SEGMENT_MAX = [31, 12];
const SEGMENT_COUNT = 3;
const TABBABLE = 'button:not([disabled]):not([tabindex="-1"])';

let nextPanelId = 0;

/** `yyyy-MM-dd` for a typed `d.M.yyyy` date that exists and lies in the supported years, else `''`. */
function toIso(raw: string): string {
  if (!TYPED_PATTERN.test(raw)) return '';
  const parsed = parse(raw, 'd.M.yyyy', new Date());
  if (!isValid(parsed)) return '';
  const iso = format(parsed, ISO_FORMAT);
  return iso < MIN_ISO || iso > MAX_ISO ? '' : iso;
}

/** Start and end index of the day, month and year in a text with exactly two dots, else `undefined`. */
function segmentRanges(text: string): [number, number][] | undefined {
  const parts = text.split('.');
  if (parts.length !== SEGMENT_COUNT) return undefined;
  let start = 0;
  return parts.map((part): [number, number] => {
    const range: [number, number] = [start, start + part.length];
    start += part.length + 1;
    return range;
  });
}

/** True when every segment before the last one is complete, so digits can safely flow on. */
function hasFullLeadingSegments(raw: string): boolean {
  return raw
    .replaceAll(/[^\d.]/g, '')
    .split('.')
    .slice(0, -1)
    .every((part) => part.length === 2);
}

/** True when the segment (0 = day, 1 = month, 2 = year) can still become a valid one. */
function isSegmentValid(segment: string, index: number): boolean {
  if (index === 2) return segment === '' || (segment.length <= 4 && isYearPrefixPossible(segment));
  const value = Number(segment);
  return segment.length <= 2 && (segment.length < 2 || (value >= 1 && value <= SEGMENT_MAX[index]));
}

/** True when some year between `MIN_YEAR` and `MAX_YEAR` starts with the given year digits. */
function isYearPrefixPossible(prefix: string): boolean {
  const size = 10 ** (4 - prefix.length);
  const first = Number(prefix) * size;
  return first + size - 1 >= MIN_YEAR && first <= MAX_YEAR;
}

/** True when the typed digits so far still have a valid day, month and year prefix. */
function isMaskPrefixValid(digits: string): boolean {
  const day = Number(digits.slice(0, 2));
  const month = Number(digits.slice(2, 4));
  if (digits.length >= 2 && (day < 1 || day > 31)) return false;
  if (digits.length >= 4 && (month < 1 || month > 12)) return false;
  return digits.length <= 4 || isYearPrefixPossible(digits.slice(4));
}

/**
 * Turns typed digits into `dd.MM.yyyy` as the user types. A first day digit above 3 or a first
 * month digit above 1 gets a leading 0, and a digit that would make the day 00 or above 31, the
 * month 00 or above 12, or the year fall outside 1900-2999, is dropped. Dots are only added once a
 * further digit follows.
 */
export function maskDate(raw: string): string {
  let digits = '';
  for (const char of raw.replaceAll(/\D/g, '')) {
    const needsPadding = (digits.length === 0 && char > '3') || (digits.length === 2 && char > '1');
    const next = needsPadding ? `${digits}0${char}` : digits + char;
    if (!isMaskPrefixValid(next)) continue;
    digits = next;
    if (digits.length === 8) break;
  }
  return [digits.slice(0, 2), digits.slice(2, 4), digits.slice(4)].filter(Boolean).join('.');
}

/**
 * Cleans text that is edited segment by segment, so a change in the day, month or year never moves
 * the other ones (`15.06.2025` minus the 6 is `15.0.2025`). Returns `undefined` when the edit has to
 * be undone: a dot was typed or deleted (`expectedParts` changes) or a segment can no longer become
 * valid. Deleting at the end may drop a trailing dot (`mayLoseDot`).
 */
export function maskSegments(
  raw: string,
  expectedParts: number,
  mayLoseDot: boolean,
): string | undefined {
  const cleaned = raw.replaceAll(/[^\d.]/g, '');
  const parts = cleaned.split('.');
  if (parts.length > SEGMENT_COUNT || (parts.length !== expectedParts && !mayLoseDot)) {
    return undefined;
  }
  return parts.every((segment, index) => isSegmentValid(segment, index)) ? cleaned : undefined;
}

interface CalendarDay {
  date: Date;
  disabled: boolean;
  inMonth: boolean;
  iso: string;
  isSelected: boolean;
  isToday: boolean;
  label: string;
  number: string;
}

/**
 * Date field with a typed `dd.MM.yyyy` input and a calendar button that opens a month grid. The
 * bound control keeps the value as a `yyyy-MM-dd` string, days before `min` cannot be picked in the
 * calendar. Arrow keys, Home/End and PageUp/PageDown move between days, Escape closes the calendar.
 * In the text field a click selects the day, month or year, Tab/Shift+Tab and Left/Right jump between
 * them, and editing one never moves the others. A typed text that is no real date (31.04.2025) gives
 * the control an `invalidDate` error.
 *
 * CommentLastReviewed: 2026-11-12
 */
@Component({
  selector: 'app-agridata-datepicker',
  imports: [
    ReactiveFormsModule,
    FontAwesomeModule,
    ClickOutsideDirective,
    I18nPipe,
    ButtonComponent,
  ],
  templateUrl: './agridata-datepicker.component.html',
})
export class AgridataDatepickerComponent {
  // Injects
  private readonly i18nService = inject(I18nService);
  private readonly injector = inject(Injector);

  // Constants
  protected readonly ButtonSize = ButtonSize;
  protected readonly ButtonVariants = ButtonVariants;
  protected readonly calendar = faCalendar;
  protected readonly chevronLeft = faChevronLeft;
  protected readonly chevronRight = faChevronRight;
  protected readonly panelId = `agridata-datepicker-panel-${nextPanelId++}`;

  // Input properties
  readonly control = input<FormControlWithMessages>();
  /** Id of the element holding the error/helper text. */
  readonly describedBy = input<string>();
  readonly disabled = input<boolean>(false);
  readonly hasError = input<boolean>(false);
  readonly id = input<string>();
  readonly isViewMode = input<boolean>(false);
  /** Earliest selectable day as `yyyy-MM-dd`. */
  readonly min = input<string | null>(null);
  readonly placeholder = input<string>('');

  // Signals
  protected readonly focusedIso = signal<string | undefined>(undefined);
  protected readonly isOpen = signal<boolean>(false);
  protected readonly panel = viewChild<ElementRef<HTMLElement>>('panel');
  protected readonly trigger = viewChild<ElementRef<HTMLElement>>('trigger');
  protected readonly openAbove = createOpenAboveSignal(this.trigger, this.panel);
  private readonly value = signal<string>('');
  private readonly viewMonth = signal<Date>(startOfMonth(new Date()));

  /** Reports typed text that is no real date, the control only holds `''` for it. */
  private readonly invalidDateValidator: ValidatorFn = (control) =>
    !control.value && this.hasInvalidText() ? { invalidDate: true } : null;

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
        disabled: this.isBeforeMin(iso) || this.isAfterMax(iso),
        inMonth: date.getMonth() === month.getMonth(),
        iso,
        isSelected: iso === selected,
        isToday: isSameDay(date, today),
        label: format(date, 'PPPP', { locale }),
        number: format(date, 'd'),
      };
    });
  });

  protected readonly displayValue = computed(() => {
    const value = this.value();
    return value ? formatDate(parseISO(value)) : undefined;
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
  protected readonly isNextMonthDisabled = computed(() =>
    this.isAfterMax(format(addMonths(this.viewMonth(), 1), ISO_FORMAT)),
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

  /** What the text field shows: follows the value, but keeps what the user types until committed. */
  protected readonly text = linkedSignal(() => this.displayValue() ?? '');

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

  private readonly hasInvalidText = computed(() => {
    const raw = this.text().trim();
    return raw !== '' && toIso(raw) === '';
  });

  private readonly locale = computed(() => LOCALES[this.i18nService.lang()] ?? de);

  // Effects
  /** Puts the `invalidDate` check first, so it wins over `required` when text was typed. */
  private readonly registerValidatorEffect = effect((onCleanup) => {
    const control = this.control();
    if (!control) return;
    const previous = control.validator;
    control.setValidators(
      previous ? [this.invalidDateValidator, previous] : this.invalidDateValidator,
    );
    control.errorMessages = {
      ...control.errorMessages,
      invalidDate: () => this.i18nService.translate('datepicker.validations.invalidDate'),
    };
    onCleanup(() => control.removeValidators(this.invalidDateValidator));
  });

  private readonly syncValueEffect = effect((onCleanup) => {
    const control = this.control();
    if (!control) return;
    this.value.set(control.value ?? '');
    const subscription = control.valueChanges.subscribe((value) => this.value.set(value ?? ''));
    onCleanup(() => subscription.unsubscribe());
  });

  /**
   * Writes the typed text to the control: a real `dd.MM.yyyy` date, otherwise an empty value. The
   * text stays visible so one wrong digit can be fixed, and the control gets an `invalidDate` error.
   * A date before `min` is left to the consumer's validator.
   */
  protected commitText(): void {
    const raw = this.text().trim();
    const iso = toIso(raw);
    const control = this.control();
    control?.setValue(iso);
    control?.markAsTouched();
    this.text.set(this.displayValue() ?? raw);
  }

  protected goToToday(): void {
    const today = new Date();
    this.viewMonth.set(startOfMonth(today));
    this.focusDay(format(today, ISO_FORMAT));
  }

  protected handleDayKeydown(event: KeyboardEvent, day: CalendarDay): void {
    const target = this.moveTarget(event, day.date);
    if (!target) return;
    event.preventDefault();
    const iso = format(target, ISO_FORMAT);
    if (this.isBeforeMin(iso) || this.isAfterMax(iso)) return;
    this.viewMonth.set(startOfMonth(target));
    this.focusDay(iso);
  }

  /** Keeps Tab and Shift+Tab cycling through the calendar's controls while it is open. */
  protected handleDialogTab(event: Event, backwards: boolean): void {
    const tabbable = Array.from(
      this.panel()?.nativeElement.querySelectorAll<HTMLElement>(TABBABLE) ?? [],
    );
    const edge = backwards ? tabbable[0] : tabbable.at(-1);
    if (!edge || document.activeElement !== edge) return;
    event.preventDefault();
    (backwards ? tabbable.at(-1) : tabbable[0])?.focus();
  }

  protected handleEscape(event: Event): void {
    if (!this.isOpen()) return;
    event.stopPropagation();
    this.focusedIso.set(undefined);
    this.isOpen.set(false);
    this.trigger()?.nativeElement.focus();
  }

  /** Closes the calendar once focus moves to something outside this component. */
  protected handleFocusOut(event: FocusEvent, host: HTMLElement): void {
    const next = event.relatedTarget;
    if (next instanceof Node && !host.contains(next)) this.isOpen.set(false);
  }

  /**
   * Text that is still being typed flows its digits into `dd.MM.yyyy`. Once it has all three
   * segments, an edit only changes its own segment, so deleting the 6 in 15.06.2025 keeps day and
   * year.
   */
  protected handleInput(event: Event): void {
    const input = event.target;
    if (!(input instanceof HTMLInputElement)) return;
    const previous = this.text();
    const raw = input.value;
    const selection = input.selectionStart ?? raw.length;
    const atEnd = selection === raw.length;
    const isDelete = event instanceof InputEvent && event.inputType.startsWith('delete');
    const previousParts = previous.split('.').length;
    const flows = previousParts < SEGMENT_COUNT || (atEnd && hasFullLeadingSegments(raw));

    if (flows) {
      const masked = maskDate(raw);
      const digitsBefore = raw.slice(0, selection).replaceAll(/\D/g, '').length;
      input.value = masked;
      this.text.set(masked);
      // Keep the caret after the same number of digits, so editing in the middle doesn't jump.
      let caret = masked.length;
      if (!atEnd) {
        let seen = 0;
        caret = masked.split('').findIndex((char) => /\d/.test(char) && ++seen > digitsBefore);
        if (caret === -1) caret = masked.length;
      }
      input.setSelectionRange(caret, caret);
      return;
    }

    // ponytail: deleting a selection that spans a dot is undone, select one segment at a time.
    const next = maskSegments(raw, previousParts, isDelete && atEnd);
    let caret = raw.slice(0, selection).replaceAll(/[^\d.]/g, '').length;
    if (next === undefined) {
      const shift = isDelete ? 0 : raw.length - previous.length;
      caret = Math.max(0, selection - shift);
    }
    input.value = next ?? previous;
    this.text.set(input.value);
    input.setSelectionRange(caret, caret);
  }

  /** A click in a complete text selects the day, month or year it landed in. */
  protected handleInputClick(event: MouseEvent): void {
    const input = event.target;
    if (!(input instanceof HTMLInputElement) || input.selectionStart !== input.selectionEnd) return;
    const caret = input.selectionStart ?? 0;
    const range = segmentRanges(input.value)?.find(
      ([start, end]) => caret >= start && caret <= end,
    );
    if (range) input.setSelectionRange(range[0], range[1]);
  }

  /**
   * Tab and Shift+Tab move to the next or previous segment, Left and Right do it from the edge of a
   * segment. At the first and last segment they do their normal job, so focus can always leave.
   */
  protected handleInputKeydown(event: KeyboardEvent): void {
    const input = event.target;
    if (!(input instanceof HTMLInputElement) || event.altKey || event.ctrlKey || event.metaKey) {
      return;
    }
    const ranges = segmentRanges(input.value);
    if (!ranges) return;
    const from = input.selectionStart ?? 0;
    const to = input.selectionEnd ?? 0;
    const index = ranges.findIndex(([start, end]) => from >= start && to <= end);
    const current = ranges[index];
    let step = 0;
    if (event.key === 'Tab') step = event.shiftKey ? -1 : 1;
    else if (event.key === 'ArrowRight' && to === current?.[1]) step = 1;
    else if (event.key === 'ArrowLeft' && from === current?.[0]) step = -1;
    const target = ranges[index + step];
    if (step === 0 || !target) return;
    event.preventDefault();
    input.setSelectionRange(target[0], target[1]);
  }

  protected selectDay(day: CalendarDay): void {
    const control = this.control();
    control?.setValue(day.iso);
    control?.markAsTouched();
    this.focusedIso.set(undefined);
    this.isOpen.set(false);
    this.trigger()?.nativeElement.focus();
  }

  protected showMonth(offset: number): void {
    this.viewMonth.update((month) => addMonths(month, offset));
  }

  protected toggleCalendar(): void {
    if (this.isOpen()) {
      this.isOpen.set(false);
      return;
    }
    const start = this.value() || this.min();
    this.viewMonth.set(startOfMonth(start ? parseISO(start) : new Date()));
    this.focusedIso.set(undefined);
    this.isOpen.set(true);
    afterNextRender(() => this.focusDay(this.focusableIso()), { injector: this.injector });
  }

  private focusDay(iso: string | undefined): void {
    if (!iso) return;
    afterNextRender(
      () => this.panel()?.nativeElement.querySelector<HTMLElement>(`[data-date="${iso}"]`)?.focus(),
      { injector: this.injector },
    );
  }

  private isAfterMax(iso: string): boolean {
    return iso > MAX_ISO;
  }

  private isBeforeMin(iso: string): boolean {
    const min = this.min();
    return iso < (min && min > MIN_ISO ? min : MIN_ISO);
  }

  /** The day a navigation key moves to, `undefined` for any other key. */
  private moveTarget(event: KeyboardEvent, from: Date): Date | undefined {
    switch (event.key) {
      case 'ArrowDown':
        return addDays(from, 7);
      case 'ArrowLeft':
        return addDays(from, -1);
      case 'ArrowRight':
        return addDays(from, 1);
      case 'ArrowUp':
        return addDays(from, -7);
      case 'End':
        return endOfWeek(from, WEEK_OPTIONS);
      case 'Home':
        return startOfWeek(from, WEEK_OPTIONS);
      case 'PageDown':
        return event.shiftKey ? addYears(from, 1) : addMonths(from, 1);
      case 'PageUp':
        return event.shiftKey ? addYears(from, -1) : addMonths(from, -1);
      default:
        return undefined;
    }
  }
}
