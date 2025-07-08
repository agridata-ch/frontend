import { Component, input, output } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-agridata-textarea',
  imports: [ReactiveFormsModule],
  templateUrl: './agridata-textarea.component.html',
  styleUrl: './agridata-textarea.component.css',
})
export class AgridataTextareaComponent {
  readonly control = input<FormControl>();
  readonly id = input<string>('');
  readonly placeholder = input<string>('');
  readonly maxCharacters = input<number | null>(1000);
  readonly hasError = input<boolean>(false);
  readonly onBlur = output<void>();
}
