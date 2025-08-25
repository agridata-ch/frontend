import { Component, input, output } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';

import { FormControlWithMessages } from '@/shared/lib/form.helper';

/**
 * Implements the logic for rendering and managing input fields. It supports text and number types,
 * configurable placeholders, prefixes, maximum character limits, and error states. It integrates
 * with Angular reactive form controls or operates independently with manual value handling. It
 * also emits input and blur events for external handling.
 *
 * CommentLastReviewed: 2025-08-25
 */
@Component({
  selector: 'app-agridata-input',
  imports: [ReactiveFormsModule],
  templateUrl: './agridata-input.component.html',
})
export class AgridataInputComponent {
  readonly id = input<string>();
  readonly control = input<FormControlWithMessages>();
  readonly type = input<'text' | 'number'>('text');
  readonly placeholder = input<string>('');
  readonly maxCharacters = input<number | null>(1000);
  readonly hasError = input<boolean>(false);
  readonly inputPrefix = input<string>('');
  readonly disabled = input<boolean>(false);
  readonly value = input<string | number>();

  readonly onBlur = output<void>();
  readonly onInput = output<string>();

  handleInputChange(event: Event) {
    if (this.onInput) {
      const inputElement = event.target as HTMLInputElement;
      const value = inputElement.value;
      this.onInput.emit(value);
    }
  }
}
