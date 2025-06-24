import {
  Component,
  ElementRef,
  HostListener,
  computed,
  inject,
  input,
  signal,
} from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faChevronDown, faChevronUp, faTimes } from '@fortawesome/free-solid-svg-icons';

import { MultiSelectOption } from '@/shared/ui/agridata-multi-select';

@Component({
  selector: 'app-agridata-multi-select',
  imports: [ReactiveFormsModule, FontAwesomeModule],
  templateUrl: './agridata-multi-select.component.html',
})
export class AgridataMultiSelectComponent {
  private readonly elementRef: ElementRef<HTMLElement> = inject(ElementRef);
  readonly control = input<FormControl>();
  readonly options = input<MultiSelectOption[]>([]);
  readonly placeholder = input<string>('');

  readonly isDropdownOpen = signal<boolean>(false);
  readonly selectedOptions = signal<MultiSelectOption[]>([]);
  readonly chevronDown = faChevronDown;
  readonly chevronUp = faChevronUp;
  readonly iconClose = faTimes;
  readonly dropdownIcon = computed(() =>
    this.isDropdownOpen() ? this.chevronUp : this.chevronDown,
  );

  toggleDropdown(): void {
    this.isDropdownOpen.update((o) => !o);
  }

  /** Whether a given option is selected */
  isSelected(id: string): boolean {
    return this.control()?.value.includes(id);
  }

  /** Called when a checkbox changes */
  onOptionToggle(value: string, event: Event): void {
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

  get displayText(): string {
    const sel = this.control()?.value ?? '';
    if (sel.length === 0) return this.placeholder();
    return this.options()
      .filter((o) => sel.includes(o.value))
      .map((o) => o.label)
      .join(', ');
  }

  @HostListener('document:click', ['$event.target'])
  onClickOutside(target: HTMLElement) {
    const host = this.elementRef.nativeElement;
    if (!host.contains(target)) {
      this.isDropdownOpen.set(false);
    }
  }
}
