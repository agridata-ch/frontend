import { Component, computed, input, signal } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faChevronDown, faChevronUp, faTimes } from '@fortawesome/free-solid-svg-icons';

import { ClickOutsideDirective } from '@/shared/click-outside/click-outside.directive';
import { FormControlWithMessages } from '@/shared/lib/form.helper';
import { MultiSelectOption } from '@/shared/ui/agridata-multi-select';

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

  isSelected(id: string) {
    return this.control()?.value.includes(id);
  }

  onOptionToggle(value: string, event: Event) {
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
