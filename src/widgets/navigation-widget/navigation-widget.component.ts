import { AuthService } from '@/shared/services/auth.service';
import { Component, computed, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faFile } from '@fortawesome/free-regular-svg-icons';
import { faChevronRight, faChevronLeft } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-navigation-widget',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, FontAwesomeModule],
  templateUrl: './navigation-widget.component.html',
  styleUrl: './navigation-widget.component.css',
})
export class NavigationWidgetComponent {
  constructor(private readonly authService: AuthService) {}

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
