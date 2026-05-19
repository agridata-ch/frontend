import { Component, computed, effect, inject, input, signal, untracked } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import {
  faChevronLeft,
  faChevronRight,
  faDatabase,
  faFileCheck,
  faUsers,
  faLayerGroup,
} from '@awesome.me/kit-0b6d1ed528/icons/classic/regular';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

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
  // Injects
  private readonly agridataStateService = inject(AgridataStateService);
  private readonly authService = inject(AuthService);
  readonly i18nService = inject(I18nService);

  // Inputs
  readonly cmsPages = input<PageData[]>([]);

  // Signals
  readonly isAnimating = signal(false);
  private readonly initialized = signal(false);

  // Computed
  readonly isNavigationOpen = computed(
    () => this.agridataStateService.userPreferences()?.mainMenuOpened,
  );
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
      this.userRoles()?.includes(USER_ROLES.AGRIDATA_DATA_REQUESTS_PROVIDER) && {
        label: 'provider.pageTitle',
        icon: faDatabase,
        route: `/${ROUTE_PATHS.DATA_REQUESTS_PROVIDER_PATH}`,
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
      this.userRoles()?.includes(USER_ROLES.AGRIDATA_ADMIN) &&
        !this.agridataStateService.isImpersonating() && {
          label: 'admin.pageTitle',
          icon: faFileCheck,
          route: `/${ROUTE_PATHS.ADMIN_PATH}`,
        },
      (this.userRoles()?.includes(USER_ROLES.AGRIDATA_ADMIN) ||
        this.userRoles()?.includes(USER_ROLES.AGRIDATA_DATA_REQUESTS_PROVIDER)) &&
        !this.agridataStateService.isImpersonating() && {
          label: 'dataCatalog.pageTitle',
          icon: faLayerGroup,
          route: `/${ROUTE_PATHS.DATA_CATALOG_PATH}`,
        },
    ].filter(Boolean),
  );

  // Effects
  private readonly _animationEffect = effect(() => {
    this.isNavigationOpen();
    if (this.initialized()) {
      untracked(() => {
        this.isAnimating.set(true);
        setTimeout(() => this.isAnimating.set(false), 150);
      });
    }
    this.initialized.set(true);
  });

  // Methods
  protected toggleNavigation = () => {
    this.agridataStateService.setMainMenuOpened(!this.isNavigationOpen());
    this.isAnimating.set(true);
    setTimeout(() => this.isAnimating.set(false), 150);
  };
}
