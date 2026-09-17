import { Component, computed, ElementRef, input, model, signal, viewChild } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import {
  faCheck,
  faChevronDown,
  faChevronUp,
} from '@awesome.me/kit-0b6d1ed528/icons/classic/regular';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

import { ClickOutsideDirective } from '@/shared/click-outside/click-outside.directive';
import { I18nPipe } from '@/shared/i18n';
import { FormControlWithMessages } from '@/shared/lib/form.helper';
import { createOpenAboveSignal } from '@/shared/utils';

import { SelectOption, SelectOptionGroup } from './agridata-select.model';

/**
 * Implements the select field logic. It manages dropdown state, tracks the selected option, and
 * synchronizes with reactive form controls. It provides placeholder text, error handling, and
 * disabled states. It also supports click-outside handling to close the dropdown and displays
 * dynamic icons for open/close state.
 *
 * CommentLastReviewed: 2025-08-25
 */
@Component({
  selector: 'app-agridata-select',
  imports: [ReactiveFormsModule, FontAwesomeModule, ClickOutsideDirective, I18nPipe],
  templateUrl: './agridata-select.component.html', // Consider renaming the template file if needed
})
export class AgridataSelectComponent {
  protected readonly popover = viewChild<ElementRef<HTMLElement>>('popover');
  protected readonly trigger = viewChild<ElementRef<HTMLElement>>('trigger');

  readonly control = input<FormControlWithMessages>();
  readonly customClass = input<string>('');
  readonly groups = input<SelectOptionGroup[]>([]);
  readonly isViewMode = input<boolean>(false);
  readonly disabled = input<boolean>(false);
  readonly hasError = input<boolean>(false);
  readonly options = input<SelectOption[]>([]);
  readonly placeholder = input<string>('');

  readonly selectedOption = model<number | string | null>(null);

  protected readonly checkIcon = faCheck;
  protected readonly chevronDown = faChevronDown;
  protected readonly chevronUp = faChevronUp;

  protected readonly isDropdownOpen = signal<boolean>(false);
  protected readonly openAbove = createOpenAboveSignal(this.trigger, this.popover);

  protected readonly dropdownIcon = computed(() =>
    this.isDropdownOpen() ? this.chevronUp : this.chevronDown,
  );
  // Flat + grouped options combined, so a selected value resolves its label regardless of source.
  private readonly allOptions = computed<SelectOption[]>(() => [
    ...this.options(),
    ...this.groups().flatMap((group) => group.options),
  ]);

  ngOnInit(): void {
    // Initialize selected option based on the control's value
    let currentValue = this.control()?.value ?? null;
    currentValue = currentValue ?? this.selectedOption();
    this.selectedOption.set(currentValue);
  }

  toggleDropdown(): void {
    this.isDropdownOpen.update((o) => !o);
  }

  isSelected(id: string | number | null) {
    return this.selectedOption() === id;
  }

  getSelectedOptionLabel() {
    return this.allOptions().find((o) => o.value === this.selectedOption())?.label ?? null;
  }

  handleOptionSelect(value: string | number | null, event: Event) {
    event.stopPropagation();
    this.selectedOption.set(value);
    this.control()?.setValue(value);
    this.isDropdownOpen.set(false);
  }

  handleClickOutside() {
    this.isDropdownOpen.set(false);
  }
}
