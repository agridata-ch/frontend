import { Component } from '@angular/core';
import { faSeedling } from '@awesome.me/kit-0b6d1ed528/icons/classic/light';
import {
  faArrowLeft,
  faArrowUpRightFromSquare,
  faPhone,
} from '@awesome.me/kit-0b6d1ed528/icons/classic/regular';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';

import { environment } from '@/environments/environment';
import { I18nDirective } from '@/shared/i18n';
import { ButtonComponent, ButtonVariants, IconPosition } from '@/shared/ui/button';
import { EmptyStateComponent } from '@/shared/ui/empty-state';

/**
 * Informs authenticated users without any agridata role that they have no access to the
 * application yet. The return button links to the homepage; contact support opens a mail to support.
 *
 * CommentLastReviewed: 2026-11-12
 */
@Component({
  selector: 'app-no-access',
  imports: [ButtonComponent, EmptyStateComponent, FaIconComponent, I18nDirective],
  host: { class: 'flex flex-col h-full' },
  templateUrl: './no-access.page.html',
})
export class NoAccessPage {
  // Constants
  protected readonly ButtonVariants = ButtonVariants;
  protected readonly IconPosition = IconPosition;
  protected readonly backIcon = faArrowLeft;
  protected readonly externalIcon = faArrowUpRightFromSquare;
  protected readonly homeUrl = environment.appBaseUrl;
  protected readonly seedlingIcon = faSeedling;
  protected readonly supportMailto = 'mailto:support@agridata.ch';
  protected readonly iconPhone = faPhone;
}
