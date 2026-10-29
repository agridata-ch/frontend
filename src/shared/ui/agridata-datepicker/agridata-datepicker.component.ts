import {
  Component,
  computed,
  effect,
  ElementRef,
  inject,
  input,
  linkedSignal,
  signal,
  viewChild,
} from '@angular/core';
import { ReactiveFormsModule, ValidatorFn } from '@angular/forms';
import { faCalendar } from '@awesome.me/kit-0b6d1ed528/icons/classic/light';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { parseISO } from 'date-fns';

import { ClickOutsideDirective } from '@/shared/click-outside/click-outside.directive';
import { formatDate } from '@/shared/date';
import { I18nPipe, I18nService } from '@/shared/i18n';
import { FormControlWithMessages } from '@/shared/lib/form.helper';
import { createOpenAboveSignal } from '@/shared/utils';

import { AgridataDatepickerCalendarComponent } from './agridata-datepicker-calendar/agridata-datepicker-calendar.component';
import {
  nextInputState,
  segmentRanges,
  segmentStepTarget,
  TABBABLE,
  toIso,
} from './agridata-datepicker.model';

let nextPanelId = 0;

/**
 * Date field with a typed `dd.MM.yyyy` input and a calendar button that opens a month grid
 * (`AgridataDatepickerCalendarComponent`). The bound control keeps the value as a `yyyy-MM-dd`
 * string, days before `min` cannot be picked in the calendar. Escape closes the calendar.
 * In the text field a click selects the day, month or year, Tab/Shift+Tab and Left/Right jump between
 * them, and editing one never moves the others. A typed text that is no real date (31.04.2025) gives
 * the control an `invalidDate` error.
 *
 * CommentLastReviewed: 2026-11-16
 */
@Component({
  selector: 'app-agridata-datepicker',
  imports: [
    AgridataDatepickerCalendarComponent,
    ClickOutsideDirective,
    FontAwesomeModule,
    I18nPipe,
    ReactiveFormsModule,
  ],
  templateUrl: './agridata-datepicker.component.html',
})
export class AgridataDatepickerComponent {
  // Injects
  private readonly i18nService = inject(I18nService);

  // Constants
  protected readonly calendar = faCalendar;
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
  protected readonly isOpen = signal<boolean>(false);
  protected readonly panel = viewChild<ElementRef<HTMLElement>>('panel');
  protected readonly trigger = viewChild<ElementRef<HTMLElement>>('trigger');
  protected readonly openAbove = createOpenAboveSignal(this.trigger, this.panel);
  protected readonly value = signal<string>('');

  /** Reports typed text that is no real date, the control only holds `''` for it. */
  private readonly invalidDateValidator: ValidatorFn = (control) =>
    !control.value && this.hasInvalidText() ? { invalidDate: true } : null;

  // Computed Signals
  protected readonly displayValue = computed(() => {
    const value = this.value();
    return value ? formatDate(parseISO(value)) : undefined;
  });

  /** What the text field shows: follows the value, but keeps what the user types until committed. */
  protected readonly text = linkedSignal(() => this.displayValue() ?? '');

  private readonly hasInvalidText = computed(() => {
    const raw = this.text().trim();
    return raw !== '' && toIso(raw) === '';
  });

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
    this.isOpen.set(false);
    this.trigger()?.nativeElement.focus();
  }

  /** Closes the calendar once focus moves to something outside this component. */
  protected handleFocusOut(event: FocusEvent, host: HTMLElement): void {
    const next = event.relatedTarget;
    if (next instanceof Node && !host.contains(next)) this.isOpen.set(false);
  }

  /** Masks the typed text, see `nextInputState`. */
  protected handleInput(event: Event): void {
    const input = event.target;
    if (!(input instanceof HTMLInputElement)) return;
    const { caret, value } = nextInputState(
      this.text(),
      input.value,
      input.selectionStart ?? input.value.length,
      event instanceof InputEvent && event.inputType.startsWith('delete'),
    );
    input.value = value;
    this.text.set(value);
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
    const target = segmentStepTarget(
      input.value,
      input.selectionStart ?? 0,
      input.selectionEnd ?? 0,
      event.key,
      event.shiftKey,
    );
    if (!target) return;
    event.preventDefault();
    input.setSelectionRange(target[0], target[1]);
  }

  protected selectDay(iso: string): void {
    const control = this.control();
    control?.setValue(iso);
    control?.markAsTouched();
    this.isOpen.set(false);
    this.trigger()?.nativeElement.focus();
  }

  protected toggleCalendar(): void {
    this.isOpen.update((isOpen) => !isOpen);
  }
}
