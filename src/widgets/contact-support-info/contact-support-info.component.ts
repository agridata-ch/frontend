import { Component, signal } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faQuestionCircle } from '@fortawesome/pro-light-svg-icons';

import { ClickOutsideDirective } from '@/shared/click-outside/click-outside.directive';
import { I18nDirective } from '@/shared/i18n';
import { PopoverComponent } from '@/shared/ui/popover';
import { ContactSupportInfoContentComponent } from '@/widgets/contact-support-info/contact-support-info-content';

/**
 * Implements the visibility of the support information popover and handles user interactions
 *
 * CommentLastReviewed: 2025-09-08
 */
@Component({
  selector: 'app-contact-support-info',
  imports: [
    PopoverComponent,
    I18nDirective,
    FontAwesomeModule,
    ClickOutsideDirective,
    ContactSupportInfoContentComponent,
  ],
  templateUrl: './contact-support-info.component.html',
})
export class ContactSupportInfoComponent {
  protected readonly showPopover = signal(false);

  protected readonly iconQuestion = faQuestionCircle;

  protected readonly handleToggle = () => {
    this.showPopover.set(!this.showPopover());
  };

  protected readonly closeOverlay = () => {
    this.showPopover.set(false);
  };
}
