import { Component, inject } from '@angular/core';
import { faEnvelope, faGlobe, faPhone } from '@awesome.me/kit-0b6d1ed528/icons/classic/regular';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

import { environment } from '@/environments/environment';
import { I18nDirective, I18nService } from '@/shared/i18n';

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
  protected readonly i18nService = inject(I18nService);
  protected readonly phoneNumber = this.i18nService.translateSignal('support-info.phoneNumber');
  protected readonly email = this.i18nService.translateSignal('support-info.email');

  protected readonly iconPhone = faPhone;
  protected readonly iconEmail = faEnvelope;
  protected readonly iconGlobe = faGlobe;
  protected readonly appBaseUrl = environment.appBaseUrl;
}
