import { Component, computed, input, signal } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons';

import { ClickOutsideDirective } from '@/shared/click-outside/click-outside.directive';
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
  imports: [ReactiveFormsModule, FontAwesomeModule, ClickOutsideDirective],
  templateUrl: './agridata-select.component.html', // Consider renaming the template file if needed
})
export class AgridataSelectComponent {
  readonly control = input<FormControlWithMessages>();
  readonly options = input<MultiSelectOption[]>([]);
  readonly placeholder = input<string>('');
  readonly hasError = input<boolean>(false);
  readonly disabled = input<boolean>(false);

  readonly isDropdownOpen = signal<boolean>(false);
  readonly selectedOption = signal<MultiSelectOption | null>(null);
  readonly chevronDown = faChevronDown;
  readonly chevronUp = faChevronUp;
  readonly dropdownIcon = computed(() =>
    this.isDropdownOpen() ? this.chevronUp : this.chevronDown,
  );

  ngOnInit() {
    // Initialize selected option based on the control's value
    const currentValue = this.control()?.value ?? null;
    const selected = this.options().find((o) => o.value === currentValue) ?? null;

    this.selectedOption.set(selected);
  }

  toggleDropdown(): void {
    this.isDropdownOpen.update((o) => !o);
  }

  isSelected(id: string) {
    return this.control()?.value === id;
  }

  onOptionSelect(value: string, event: Event) {
    event.stopPropagation();
    const selected = this.options().find((o) => o.value === value) ?? null;
    this.selectedOption.set(selected);
    this.control()?.setValue(value);
    this.isDropdownOpen.set(false);
  }

  handleClickOutside() {
    this.isDropdownOpen.set(false);
  }
}
