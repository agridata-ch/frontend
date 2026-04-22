import { Component, input, model } from '@angular/core';
import { FormsModule } from '@angular/forms';

/**
 * Implements a toggle switch with two-way binding, disabled state,
 * and accessible labeling via aria-label or visible label.
 *
 * CommentLastReviewed: 2026-03-17
 */
@Component({
  selector: 'app-agridata-toggle',
  imports: [FormsModule],
  templateUrl: './agridata-toggle.component.html',
})
export class AgridataToggleComponent {
  readonly ariaLabel = input<string>('');
  readonly disabled = input<boolean>(false);
  readonly label = input<string>('');

  // Model properties
  readonly checked = model<boolean>(false);
}
