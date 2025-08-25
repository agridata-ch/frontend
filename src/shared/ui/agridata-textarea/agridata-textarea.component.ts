import { Component, input, output } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';

import { FormControlWithMessages } from '@/shared/lib/form.helper';

/**
 * Implements the textarea logic. It supports binding to reactive form controls, placeholder text,
 * maximum character limits, error states, and disabled states. It also emits blur events for
 * external handling and displays character counters when limits are set.
 *
 * CommentLastReviewed: 2025-08-25
 */
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
