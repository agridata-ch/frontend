import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faFile } from '@fortawesome/free-regular-svg-icons';
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';

import { AuthService } from '@/shared/lib/auth';

@Component({
  selector: 'app-navigation-widget',
  imports: [RouterLink, RouterLinkActive, FontAwesomeModule],
  templateUrl: './navigation-widget.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NavigationWidgetComponent {
  private readonly authService = inject(AuthService);

  readonly isNavigationOpen = signal(false);
  readonly chevronIcon = computed(() => (this.isNavigationOpen() ? faChevronLeft : faChevronRight));
  readonly showNavigation = computed(() => this.authService.isAuthenticated());
  readonly userRoles = computed(() => this.authService.userRoles());

  readonly navigationItems = computed(() => [
    this.userRoles()?.includes('agridata.ch.Agridata_Einwilliger') && {
      label: 'Freigaben',
      icon: faFile,
      route: '/consent-requests',
    },
  ]);

  toggleNavigation = () => {
    this.isNavigationOpen.update((prev) => !prev);
  };
}
