import { CommonModule } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { faChevronLeft, faChevronRight } from '@awesome.me/kit-0b6d1ed528/icons/classic/regular';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

import { AgridataStateService } from '@/entities/api/agridata-state.service';
import { I18nPipe } from '@/shared/i18n/i18n.pipe';
import { AuthService } from '@/shared/lib/auth';
import { ToastComponent } from '@/shared/ui/toast';
import { CookiebannerComponent } from '@/widgets/cookiebanner';
import { FooterWidgetComponent } from '@/widgets/footer-widget';
import { HeaderWidgetComponent } from '@/widgets/header-widget';
import { NavigationWidgetComponent } from '@/widgets/navigation-widget';
import { NewYearBannerComponent } from '@/widgets/new-year-banner';
import { SupporterOverlayComponent } from '@/widgets/supporter-overlay/supporter-overlay.component';

/**
 * Provides a layout with header, navigation, footer, and toast notifications. It reacts to
 * authentication state changes to refresh the application when users log out or log back in.
 *
 * CommentLastReviewed: 2025-10-06
 */
@Component({
  selector: 'app-default-layout',
  imports: [
    CommonModule,
    FontAwesomeModule,
    I18nPipe,
    RouterModule,
    CookiebannerComponent,
    FooterWidgetComponent,
    HeaderWidgetComponent,
    NavigationWidgetComponent,
    NewYearBannerComponent,
    SupporterOverlayComponent,
    ToastComponent,
  ],
  templateUrl: './default-layout.component.html',
})
export class DefaultLayoutComponent {
  private readonly authService = inject(AuthService);
  protected readonly agridataStateService = inject(AgridataStateService);

  protected readonly isNavigationOpen = computed(
    () => this.agridataStateService.userPreferences()?.mainMenuOpened,
  );
  protected readonly navIcon = computed(() =>
    this.isNavigationOpen() ? faChevronLeft : faChevronRight,
  );
  protected readonly showCookieBanner = computed(() =>
    this.agridataStateService.showCookiebanner(),
  );
  protected readonly showNavigation = computed(() => this.authService.isAuthenticated());

  protected toggleNavigation = () => {
    this.agridataStateService.setMainMenuOpened(!this.isNavigationOpen());
  };
}
