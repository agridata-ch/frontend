import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faFile } from '@fortawesome/free-regular-svg-icons';
import { faChevronLeft, faChevronRight, faDatabase } from '@fortawesome/free-solid-svg-icons';

import { ROUTE_PATHS, USER_ROLES } from '@/shared/constants/constants';
import { I18nService } from '@/shared/i18n';
import { I18nPipe } from '@/shared/i18n/i18n.pipe';
import { AuthService } from '@/shared/lib/auth';

@Component({
  selector: 'app-navigation-widget',
  imports: [RouterLink, RouterLinkActive, FontAwesomeModule, I18nPipe],
  templateUrl: './navigation-widget.component.html',
})
export class NavigationWidgetComponent {
  private readonly authService = inject(AuthService);
  readonly i18nService = inject(I18nService);

  readonly isNavigationOpen = signal(false);
  readonly chevronIcon = computed(() => (this.isNavigationOpen() ? faChevronLeft : faChevronRight));
  readonly showNavigation = computed(() => this.authService.isAuthenticated());
  readonly userRoles = computed(() => this.authService.userRoles());

  readonly navigationItems = computed(() =>
    [
      this.userRoles()?.includes(USER_ROLES.AGRIDATA_CONSENT_REQUESTS_PRODUCER) && {
        label: 'producer.pageTitle',
        icon: faFile,
        route: ROUTE_PATHS.CONSENT_REQUEST_PRODUCER_PATH,
      },
      this.userRoles()?.includes(USER_ROLES.AGRIDATA_DATA_REQUESTS_CONSUMER) && {
        label: 'consumer.pageTitle',
        icon: faDatabase,
        route: ROUTE_PATHS.DATA_REQUESTS_CONSUMER_PATH,
      },
    ].filter(Boolean),
  );

  isAnimating = signal(false);

  toggleNavigation = () => {
    this.isNavigationOpen.update((prev) => !prev);
    this.isAnimating.set(true);
    setTimeout(() => this.isAnimating.set(false), 150);
  };
}
