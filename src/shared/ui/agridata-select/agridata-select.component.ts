import {
  Component,
  ElementRef,
  HostListener,
  computed,
  inject,
  input,
  signal,
} from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons';

import { FormControlWithMessages } from '@/shared/lib/form.helper';
import { MultiSelectOption } from '@/shared/ui/agridata-multi-select';

@Component({
  selector: 'app-agridata-select',
  imports: [ReactiveFormsModule, FontAwesomeModule],
  templateUrl: './agridata-select.component.html', // Consider renaming the template file if needed
})
export class AgridataSelectComponent {
  private readonly elementRef: ElementRef<HTMLElement> = inject(ElementRef);
  readonly control = input<FormControlWithMessages>();
  readonly options = input<MultiSelectOption[]>([]);
  readonly placeholder = input<string>('');
  readonly hasError = input<boolean>(false);

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

  @HostListener('document:click', ['$event.target'])
  onClickOutside(target: HTMLElement) {
    const host = this.elementRef.nativeElement;
    if (!host.contains(target)) {
      this.isDropdownOpen.set(false);
    }
  }
}
