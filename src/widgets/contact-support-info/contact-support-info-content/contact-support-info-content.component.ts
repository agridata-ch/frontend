import { Component, signal } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faPhone, faEnvelope } from '@fortawesome/pro-regular-svg-icons';

import { I18nDirective } from '@/shared/i18n';

/**
 * Renders the contact support informations. It provides the necessary details for users
 * to get in touch with support, including phone and email contact.
 *
 * CommentLastReviewed: 2025-09-08
 */
@Component({
  selector: 'app-contact-support-info-content',
  imports: [FontAwesomeModule, I18nDirective],
  templateUrl: './contact-support-info-content.component.html',
})
export class ContactSupportInfoContentComponent {
  protected readonly phoneNumber = signal('0041 032 123 45 67');
  protected readonly email = signal('support@agridata.ch');

  protected readonly iconPhone = faPhone;
  protected readonly iconEmail = faEnvelope;
}
