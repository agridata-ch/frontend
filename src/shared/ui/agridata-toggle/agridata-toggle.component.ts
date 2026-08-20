import { Component, input, model } from '@angular/core';
import { FormsModule } from '@angular/forms';

/**
 * Implements a toggle switch with two-way binding, disabled state,
 * and accessible labeling via aria-label or visible label.
 *
 * The label sits to the right of the switch by default; add a
 * `flex-row-reverse` class on the host to move it left (responsive
 * variants like `sm:flex-row-reverse` work too).
 *
 * CommentLastReviewed: 2026-08-20
 */
@Component({
  selector: 'app-agridata-toggle',
  imports: [FormsModule],
  templateUrl: './agridata-toggle.component.html',
  host: {
    class: 'group inline-flex items-center gap-3',
  },
})
export class AgridataToggleComponent {
  // Inputs
  readonly ariaLabel = input<string>('');
  readonly disabled = input<boolean>(false);
  readonly label = input<string>('');

  // Model properties
  readonly checked = model<boolean>(false);
}
