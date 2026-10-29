import { Component, input, model } from '@angular/core';

import { I18nPipe } from '@/shared/i18n';
import { ButtonComponent, ButtonVariants } from '@/shared/ui/button';

export interface FilterOption {
  label: string;
  value: string | null;
  count?: number;
}

/**
 * Row of toggle buttons to filter a list by a single value. Clicking the selected button again
 * resets the selection to null.
 *
 * CommentLastReviewed: 2026-10-29
 */
@Component({
  selector: 'app-filter-buttons',
  imports: [ButtonComponent, I18nPipe],
  templateUrl: './filter-buttons.component.html',
})
export class FilterButtonsComponent {
  // Constants
  protected readonly ButtonVariants = ButtonVariants;

  // Input properties
  readonly options = input.required<FilterOption[]>();

  // Model properties
  readonly selectedValue = model<string | null>(null);

  protected handleClick(value: string | null) {
    this.selectedValue.set(this.selectedValue() === value ? null : value);
  }
}
