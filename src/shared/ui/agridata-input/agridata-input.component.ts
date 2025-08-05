import { Component, input, output } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';

import { FormControlWithMessages } from '@/shared/lib/form.helper';

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
