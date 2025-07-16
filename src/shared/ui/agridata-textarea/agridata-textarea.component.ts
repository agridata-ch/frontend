import { Component, input, output } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';

import { FormControlWithMessages } from '@/shared/lib/form.helper';

@Component({
  selector: 'app-agridata-textarea',
  imports: [ReactiveFormsModule],
  templateUrl: './agridata-textarea.component.html',
})
export class AgridataTextareaComponent {
  readonly control = input<FormControlWithMessages>();
  readonly id = input<string>('');
  readonly placeholder = input<string>('');
  readonly maxCharacters = input<number | null>(1000);
  readonly hasError = input<boolean>(false);
  readonly disabled = input<boolean>(false);

  readonly onBlur = output<void>();
}
