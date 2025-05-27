import { Component, computed, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faFile } from '@fortawesome/free-regular-svg-icons';
import { faChevronRight, faChevronLeft } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-navigation-widget',
  imports: [RouterLink, RouterLinkActive, FontAwesomeModule],
  templateUrl: './navigation-widget.component.html',
  styleUrl: './navigation-widget.component.css',
})
export class NavigationWidgetComponent {
  readonly isNavigationOpen = signal(false);
  readonly chevronIcon = computed(() => (this.isNavigationOpen() ? faChevronLeft : faChevronRight));
  readonly userRoles = computed(() => {
    try {
      return JSON.parse(sessionStorage.getItem('userRoles') ?? '[]');
    } catch {
      return [];
    }
  });
  readonly showNavigation = computed(() => this.userRoles().length > 0);
  readonly navigationItems = [
    this.userRoles()?.includes('agridata.ch.Agridata_Einwilliger') && {
      label: 'Freigaben',
      icon: faFile,
      route: '/consent-requests',
    },
  ];

  toggleNavigation = () => {
    this.isNavigationOpen.update((prev) => !prev);
  };
}
