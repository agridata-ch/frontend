import { Component, computed, input, signal } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import {
  faChevronDown,
  faChevronUp,
  faTimes,
} from '@awesome.me/kit-0b6d1ed528/icons/classic/regular';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

import { ClickOutsideDirective } from '@/shared/click-outside/click-outside.directive';
import { FormControlWithMessages } from '@/shared/lib/form.helper';
import { MultiSelectOption } from '@/shared/ui/agridata-multi-select';

/**
 * Implements the multi-select logic. It manages dropdown state, tracks selected options, and
 * synchronizes values with Angular reactive form controls. It provides user interactions such
 * as toggling selections, removing items, and closing the dropdown when clicking outside.
 *
 * CommentLastReviewed: 2025-08-25
 */
@Component({
  selector: 'app-agridata-multi-select',
  imports: [ReactiveFormsModule, FontAwesomeModule, ClickOutsideDirective],
  templateUrl: './agridata-multi-select.component.html',
})
export class AgridataMultiSelectComponent {
  readonly control = input<FormControlWithMessages>();
  readonly options = input<MultiSelectOption[]>([]);
  readonly placeholder = input<string>('');
  readonly hasError = input<boolean>(false);
  readonly disabled = input<boolean>(false);

  readonly isDropdownOpen = signal<boolean>(false);
  readonly selectedOptions = signal<MultiSelectOption[]>([]);
  readonly chevronDown = faChevronDown;
  readonly chevronUp = faChevronUp;
  readonly iconClose = faTimes;
  readonly dropdownIcon = computed(() =>
    this.isDropdownOpen() ? this.chevronUp : this.chevronDown,
  );

  ngOnInit() {
    // Initialize selected options based on the control's value
    const currentValue = this.control()?.value || [];
    this.selectedOptions.set(
      this.options().filter((o) => {
        return currentValue.includes(o.value);
      }),
    );
  }

  toggleDropdown() {
    this.isDropdownOpen.update((o) => !o);
  }

  isSelected(id: string | number) {
    return this.control()?.value.includes(id);
  }

  onOptionToggle(value: string | number, event: Event) {
    if (this.disabled()) return;
    event.stopPropagation();
    const checked = (event.target as HTMLInputElement).checked;
    const current = Array.isArray(this.control()?.value) ? [...this.control()!.value] : [];
    if (checked) {
      current.push(value);
    } else {
      const idx = current.indexOf(value);
      if (idx > -1) current.splice(idx, 1);
    }
    this.selectedOptions.set(
      current
        .map((id) => this.options().find((o) => o.value === id))
        .filter(Boolean) as MultiSelectOption[],
    );
    this.control()?.setValue(current);
  }

  handleClickOutside() {
    this.isDropdownOpen.set(false);
  }
}
