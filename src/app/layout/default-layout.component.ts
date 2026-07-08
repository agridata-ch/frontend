import { Component, computed, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { faChevronLeft, faChevronRight } from '@awesome.me/kit-0b6d1ed528/icons/classic/regular';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

import { AgridataStateService } from '@/entities/api/agridata-state.service';
import { I18nService } from '@/shared/i18n';
import { AuthService } from '@/shared/lib/auth';
import { TooltipDirective } from '@/shared/tooltip';
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
    FontAwesomeModule,
    RouterModule,
    CookiebannerComponent,
    FooterWidgetComponent,
    HeaderWidgetComponent,
    NavigationWidgetComponent,
    NewYearBannerComponent,
    SupporterOverlayComponent,
    ToastComponent,
    TooltipDirective,
  ],
  templateUrl: './default-layout.component.html',
})
export class DefaultLayoutComponent {
  protected readonly agridataStateService = inject(AgridataStateService);
  private readonly authService = inject(AuthService);
  private readonly i18nService = inject(I18nService);

  // Signals
  private readonly navigationOpenTranslation = this.i18nService.translateSignal('navigation.open');
  private readonly navigationCloseTranslation =
    this.i18nService.translateSignal('navigation.close');

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
  protected readonly navIconAriaText = computed(() =>
    this.isNavigationOpen() ? this.navigationCloseTranslation() : this.navigationOpenTranslation(),
  );

  protected toggleNavigation = () => {
    this.agridataStateService.setMainMenuOpened(!this.isNavigationOpen());
  };
}
