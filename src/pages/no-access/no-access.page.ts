import { Component, inject } from '@angular/core';
import { faSeedling } from '@awesome.me/kit-0b6d1ed528/icons/classic/light';
import {
  faArrowLeft,
  faArrowUpRightFromSquare,
} from '@awesome.me/kit-0b6d1ed528/icons/classic/regular';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';

import { environment } from '@/environments/environment';
import { ROUTE_PATHS } from '@/shared/constants/constants';
import { I18nDirective } from '@/shared/i18n';
import { AuthService } from '@/shared/lib/auth';
import { ButtonComponent, ButtonVariants, HrefTarget, IconPosition } from '@/shared/ui/button';

/**
 * Informs authenticated users without any agridata role that they have no access to the
 * application yet. The return button logs the user out and returns to the homepage; contact support
 * opens the CMS contact page with the contact form in a new tab.
 *
 * CommentLastReviewed: 2026-11-17
 */
@Component({
  selector: 'app-no-access',
  imports: [ButtonComponent, FaIconComponent, I18nDirective],
  host: { class: 'flex flex-col h-full' },
  templateUrl: './no-access.page.html',
})
export class NoAccessPage {
  // Injects
  private readonly authService = inject(AuthService);

  // Constants
  protected readonly ButtonVariants = ButtonVariants;
  protected readonly HrefTarget = HrefTarget;
  protected readonly IconPosition = IconPosition;
  protected readonly backIcon = faArrowLeft;
  protected readonly externalIcon = faArrowUpRightFromSquare;
  protected readonly seedlingIcon = faSeedling;
  protected readonly supportUrl = `${environment.appBaseUrl}/${ROUTE_PATHS.CMS_PATH}/contact#contact-form`;

  protected handleReturn(): void {
    void this.authService.logout();
  }
}
