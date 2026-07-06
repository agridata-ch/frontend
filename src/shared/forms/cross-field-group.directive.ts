import { Directive, inject } from '@angular/core';
import { ControlContainer, FormGroup } from '@angular/forms';

import { revalidateCrossFieldGroup } from './cross-field.validators';

/**
 * Revalidates a cross-field form group on bubbled input events.
 *
 * CommentLastReviewed: 2026-07-06
 */
@Directive({
  selector: '[appCrossFieldGroup]',
  host: { '(input)': 'revalidate()' },
})
export class CrossFieldGroupDirective {
  private readonly controlContainer = inject(ControlContainer);

  protected revalidate(): void {
    const control = this.controlContainer.control;

    if (control instanceof FormGroup) {
      revalidateCrossFieldGroup(control);
    }
  }
}
