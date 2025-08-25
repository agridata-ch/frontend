import { Component, input } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faEnvelope, faPhone } from '@fortawesome/free-solid-svg-icons';

import { I18nDirective } from '@/shared/i18n';

/**
 * Implements the logic for rendering contact details. It accepts phone number and email as inputs,
 * binds them to interactive links, and integrates FontAwesome icons for visual clarity.
 *
 * CommentLastReviewed: 2025-08-25
 */
@Component({
  selector: 'app-data-request-contact',
  imports: [I18nDirective, FontAwesomeModule],
  templateUrl: './data-request-contact.component.html',
})
export class DataRequestContactComponent {
  readonly phoneNumber = input<string>();
  readonly email = input<string>();

  readonly iconPhone = faPhone;
  readonly iconEmail = faEnvelope;
}
