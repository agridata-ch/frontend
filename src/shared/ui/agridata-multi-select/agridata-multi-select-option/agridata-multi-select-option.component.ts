import { Component, input, output } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

import { FormControlWithMessages } from '@/shared/lib/form.helper';
import { MultiSelectOption } from '@/shared/ui/agridata-multi-select';

/**
 * Implements the multi-select-option logic. It represents an individual option within the multi-select component.
 *
 * CommentLastReviewed: 2026-02-04
 */
@Component({
  selector: 'app-agridata-multi-select-option',
  imports: [ReactiveFormsModule, FontAwesomeModule],
  templateUrl: './agridata-multi-select-option.component.html',
})
export class AgridataMultiSelectOptionComponent {
  readonly control = input.required<FormControlWithMessages>();
  readonly option = input.required<MultiSelectOption>();
  readonly disabled = input<boolean>(false);

  readonly selectOption = output<{ value: string | number; event: Event }>();

  isSelected(id: string | number) {
    return this.control()?.value.includes(id);
  }
}
