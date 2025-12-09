import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { faClose } from '@awesome.me/kit-0b6d1ed528/icons/classic/regular';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

import { AnalyticsService } from '@/app/analytics.service';
import { AgridataStateService } from '@/entities/api/agridata-state.service';
import { ROUTE_PATHS } from '@/shared/constants/constants';
import { I18nDirective } from '@/shared/i18n';
import { ButtonComponent, ButtonVariants } from '@/shared/ui/button';

/**
 * Component for displaying a cookie consent banner. It interacts with the AnalyticsService to
 * enable Google Analytics tracking upon user consent. The banner can be dismissed and the user's
 * choice is stored in local storage.
 *
 * CommentLastReviewed: 2025-12-08
 */
@Component({
  selector: 'app-cookiebanner',
  imports: [ButtonComponent, I18nDirective, FontAwesomeModule, RouterLink],
  templateUrl: './cookiebanner.component.html',
})
export class CookiebannerComponent {
  protected readonly agridataStateService = inject(AgridataStateService);
  protected readonly analyticsService = inject(AnalyticsService);

  protected readonly ButtonVariants = ButtonVariants;
  protected readonly closeIcon = faClose;
  protected readonly ROUTE_PATHS = ROUTE_PATHS;

  protected acceptCookies(): void {
    this.analyticsService.setCookiesAccepted(true);
    this.closeCookieBanner();
  }

  protected closeCookieBanner(): void {
    this.agridataStateService.hideCookieBanner();
  }

  protected declineCookies(): void {
    this.analyticsService.setCookiesAccepted(false);
    this.closeCookieBanner();
  }
}
