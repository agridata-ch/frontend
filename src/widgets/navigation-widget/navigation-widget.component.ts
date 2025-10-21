import { Component, computed, inject, input, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faFileCheck,
  faChevronLeft,
  faChevronRight,
  faDatabase,
  faUsers,
} from '@fortawesome/pro-regular-svg-icons';

import { AgridataStateService } from '@/entities/api/agridata-state.service';
import { PageData } from '@/entities/cms';
import { ROUTE_PATHS, USER_ROLES } from '@/shared/constants/constants';
import { I18nService } from '@/shared/i18n';
import { I18nPipe } from '@/shared/i18n/i18n.pipe';
import { AuthService } from '@/shared/lib/auth';
import { MobileNavigationWidgetComponent } from '@/widgets/navigation-widget/mobile-navigation-widget';

/**
 * Implements the logic for navigation display and interaction. It conditionally renders items
 * based on user roles, manages open/close state with animated transitions, and provides accessible
 * controls for toggling visibility. It integrates authentication, routing, and internationalization
 * services.
 *
 * CommentLastReviewed: 2025-08-25
 */
@Component({
  selector: 'app-navigation-widget',
  imports: [
    RouterLink,
    RouterLinkActive,
    FontAwesomeModule,
    I18nPipe,
    MobileNavigationWidgetComponent,
  ],
  templateUrl: './navigation-widget.component.html',
})
export class NavigationWidgetComponent {
  private readonly authService = inject(AuthService);
  private readonly agridataStateService = inject(AgridataStateService);
  readonly i18nService = inject(I18nService);

  readonly cmsPages = input<PageData[]>([]);

  readonly isNavigationOpen = computed(this.agridataStateService.isNavigationOpen);
  readonly navIcon = computed(() => (this.isNavigationOpen() ? faChevronLeft : faChevronRight));
  readonly showNavigation = computed(() => this.authService.isAuthenticated());
  readonly userRoles = computed(() => this.authService.userRoles());

  readonly navigationItems = computed(() =>
    [
      (this.userRoles()?.includes(USER_ROLES.AGRIDATA_CONSENT_REQUESTS_PRODUCER) ||
        this.agridataStateService.isImpersonating()) && {
        label: 'producer.pageTitle',
        icon: faFileCheck,
        route: `/${ROUTE_PATHS.CONSENT_REQUEST_PRODUCER_PATH}`,
      },
      this.userRoles()?.includes(USER_ROLES.AGRIDATA_DATA_REQUESTS_CONSUMER) && {
        label: 'consumer.pageTitle',
        icon: faDatabase,
        route: `/${ROUTE_PATHS.DATA_REQUESTS_CONSUMER_PATH}`,
      },
      this.userRoles()?.includes(USER_ROLES.AGRIDATA_SUPPORTER) &&
        !this.agridataStateService.isImpersonating() && {
          label: 'supporter.pageTitle',
          icon: faUsers,
          route: `/${ROUTE_PATHS.SUPPORT_PATH}`,
        },
    ].filter(Boolean),
  );

  readonly isAnimating = signal(false);

  toggleNavigation = () => {
    this.agridataStateService.setNavigationState(!this.isNavigationOpen());
    this.isAnimating.set(true);
    setTimeout(() => this.isAnimating.set(false), 150);
  };
}
