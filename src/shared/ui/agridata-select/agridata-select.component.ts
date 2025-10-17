import {
  Component,
  ElementRef,
  computed,
  effect,
  input,
  model,
  signal,
  viewChild,
} from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faChevronDown, faChevronUp } from '@fortawesome/pro-regular-svg-icons';

import { ClickOutsideDirective } from '@/shared/click-outside/click-outside.directive';
import { I18nPipe } from '@/shared/i18n';
import { FormControlWithMessages } from '@/shared/lib/form.helper';
import { MultiSelectOption } from '@/shared/ui/agridata-multi-select';

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
  protected readonly popover = viewChild<ElementRef>('popover');
  protected readonly trigger = viewChild<ElementRef>('trigger');

  readonly control = input<FormControlWithMessages>();
  readonly options = input<MultiSelectOption[]>([]);
  readonly placeholder = input<string>('');
  readonly hasError = input<boolean>(false);
  readonly disabled = input<boolean>(false);

  readonly selectedOption = model<MultiSelectOption['value'] | null>(null);

  protected readonly chevronDown = faChevronDown;
  protected readonly chevronUp = faChevronUp;

  protected readonly isDropdownOpen = signal<boolean>(false);
  protected readonly openAbove = signal(false);

  protected readonly dropdownIcon = computed(() =>
    this.isDropdownOpen() ? this.chevronUp : this.chevronDown,
  );

  protected readonly popoverCalculator = effect(() => {
    if (this.popover() && this.trigger()) {
      const rect = this.trigger()?.nativeElement.getBoundingClientRect();
      const rectPopover = this.popover()?.nativeElement.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      this.openAbove.set(spaceBelow < rectPopover.height);
    }
  });

  ngOnInit() {
    // Initialize selected option based on the control's value
    let currentValue = this.control()?.value ?? null;
    currentValue = currentValue ?? this.selectedOption();
    this.selectedOption.set(currentValue);
  }

  toggleDropdown(): void {
    this.isDropdownOpen.update((o) => !o);
  }

  isSelected(id: string | number) {
    return this.control()?.value === id;
  }

  getSelectedOptionLabel() {
    return this.options().find((o) => o.value === this.selectedOption())?.label ?? null;
  }

  handleOptionSelect(value: string | number, event: Event) {
    event.stopPropagation();
    this.selectedOption.set(value);
    this.control()?.setValue(value);
    this.isDropdownOpen.set(false);
  }

  handleClickOutside() {
    this.isDropdownOpen.set(false);
  }
}
