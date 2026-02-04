import { Component, computed, effect, inject, input, signal } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import {
  faChevronDown,
  faChevronUp,
  faSearch,
  faTimes,
} from '@awesome.me/kit-0b6d1ed528/icons/classic/regular';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

import { ClickOutsideDirective } from '@/shared/click-outside/click-outside.directive';
import { I18nPipe, I18nService } from '@/shared/i18n';
import { FormControlWithMessages } from '@/shared/lib/form.helper';
import {
  ALL_OPTIONS_PREFIX,
  MultiSelectCategory,
  MultiSelectOption,
} from '@/shared/ui/agridata-multi-select';

import { AgridataMultiSelectOptionComponent } from './agridata-multi-select-option/agridata-multi-select-option.component';
import { SearchInputComponent } from '../filter-input/search-input.component';

/**
 * Implements the multi-select logic. It manages dropdown state, tracks selected options, and
 * synchronizes values with Angular reactive form controls. It provides user interactions such
 * as toggling selections, removing items, and closing the dropdown when clicking outside.
 *
 * CommentLastReviewed: 2025-08-25
 */
@Component({
  selector: 'app-agridata-multi-select',
  imports: [
    ReactiveFormsModule,
    FontAwesomeModule,
    ClickOutsideDirective,
    AgridataMultiSelectOptionComponent,
    I18nPipe,
    SearchInputComponent,
  ],
  templateUrl: './agridata-multi-select.component.html',
  host: { class: 'block min-w-0' },
})
export class AgridataMultiSelectComponent {
  // Injects
  private readonly i18nService = inject(I18nService);

  // Constants
  protected readonly chevronDown = faChevronDown;
  protected readonly chevronUp = faChevronUp;
  protected readonly iconClose = faTimes;
  protected readonly iconSearch = faSearch;

  // Input properties
  readonly categories = input<MultiSelectCategory[]>([]);
  readonly control = input<FormControlWithMessages>();
  readonly customClass = input<string>('');
  readonly disabled = input<boolean>(false);
  readonly enableSearch = input<boolean>(true);
  readonly hasError = input<boolean>(false);
  readonly options = input<MultiSelectOption[]>([]);
  readonly placeholder = input<string>('');
  readonly singleCategorySelection = input<boolean>(false);

  // Signals
  readonly isDropdownOpen = signal<boolean>(false);
  readonly searchTerm = signal<string>('');
  readonly selectedOptions = signal<MultiSelectOption[]>([]);

  protected readonly selectAllLabel = this.i18nService.translateSignal(
    'input.formControl.multiSelect.selectAll',
  );

  // Computed Signals
  protected readonly activeCategoryLabel = computed<string | null>(() => {
    if (!this.singleCategorySelection()) return null;

    const selectedOpts = this.selectedOptions();
    if (selectedOpts.length === 0) return null;

    for (const category of this.categories()) {
      const hasSelectedOption = category.options.some((opt) =>
        selectedOpts.some((selected) => selected.value === opt.value),
      );
      if (hasSelectedOption) {
        return category.categoryLabel;
      }
    }
    return null;
  });

  protected readonly allOptions = computed(() => {
    const flatOptions = this.options();
    const groupedOptions = this.categories().flatMap((category) => category.options);
    return flatOptions.length > 0 ? flatOptions : groupedOptions;
  });

  protected readonly dropdownIcon = computed(() =>
    this.isDropdownOpen() ? this.chevronUp : this.chevronDown,
  );

  protected readonly filteredOptions = computed(() => {
    const term = this.searchTerm().toLowerCase().trim();
    if (!term) return this.options();

    return this.options().filter((option) => option.label.toLowerCase().includes(term));
  });

  protected readonly filteredAllOptions = computed<MultiSelectOption[]>(() => {
    const term = this.searchTerm().toLowerCase().trim();
    if (!term) return this.allOptions();

    return this.allOptions().filter((option) => option.label.toLowerCase().includes(term));
  });

  protected readonly hasFilteredResults = computed<boolean>(() => {
    return this.filteredAllOptions().length > 0;
  });

  protected readonly isGrouped = computed(() => this.categories().length > 0);

  // Effects
  private readonly updateSelectedOptionsEffect = effect(() => {
    const currentValue = this.control()?.value || [];
    const availableOptions = this.allOptions();

    this.selectedOptions.set(
      availableOptions.filter(
        (o) => currentValue.includes(o.value) && !String(o.value).startsWith(ALL_OPTIONS_PREFIX),
      ),
    );
  });

  // Protected methods
  protected getFilteredCategoryOptions(category: MultiSelectCategory): MultiSelectOption[] {
    const term = this.searchTerm().toLowerCase().trim();
    if (!term) return category.options;

    return category.options.filter((option) => option.label.toLowerCase().includes(term));
  }

  protected handleClickOutside(): void {
    this.isDropdownOpen.set(false);
  }

  protected isCategoryAllSelected(category: MultiSelectCategory): boolean {
    const controlValue = this.control()?.value;
    const currentValues: (string | number)[] = Array.isArray(controlValue) ? controlValue : [];
    const currentSet = new Set<string | number>(currentValues);
    const categoryOptionValues = category.options.map((o) => o.value);
    return categoryOptionValues.every((val) => currentSet.has(val));
  }

  protected isCategoryDisabled(category: MultiSelectCategory): boolean {
    if (this.disabled()) return true;

    const activeLabel = this.activeCategoryLabel();
    if (activeLabel === null) return false;

    return category.categoryLabel !== activeLabel;
  }

  protected onOptionToggle(value: string | number, event: Event): void {
    if (this.disabled()) return;
    event.stopPropagation();

    const checked = (event.target as HTMLInputElement).checked;
    this.handleSingleOptionToggle(value, checked);
  }

  protected onSearchInput(value: string): void {
    this.searchTerm.set(value);
  }

  protected onSelectAllToggle(category: MultiSelectCategory, event: Event): void {
    if (this.disabled()) return;
    event.stopPropagation();

    const checked = (event.target as HTMLInputElement).checked;
    const categoryOptionValues = category.options.map((o) => o.value);
    const current = Array.isArray(this.control()?.value) ? [...this.control()!.value] : [];

    let newValues: (string | number)[];
    if (checked) {
      const valuesToAdd = categoryOptionValues.filter((val) => !current.includes(val));
      newValues = [...current, ...valuesToAdd];
    } else {
      newValues = current.filter((val) => !categoryOptionValues.includes(val));
    }

    this.updateControlValue(newValues);
  }

  protected toggleDropdown(): void {
    this.isDropdownOpen.update((o) => !o);
  }

  // Private methods
  private handleSingleOptionToggle(value: string | number, checked: boolean): void {
    const current = Array.isArray(this.control()?.value) ? [...this.control()!.value] : [];

    if (checked) {
      current.push(value);
    } else {
      const idx = current.indexOf(value);
      if (idx > -1) current.splice(idx, 1);
    }

    this.updateControlValue(current);
  }

  private updateControlValue(values: (string | number)[]): void {
    this.control()?.setValue(values);
    this.selectedOptions.set(
      values
        .map((id) => this.allOptions().find((o) => o.value === id))
        .filter(
          (o): o is MultiSelectOption =>
            o !== undefined && !String(o.value).startsWith(ALL_OPTIONS_PREFIX),
        ),
    );
  }
}
