import { CommonModule } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { RouterModule } from '@angular/router';

import { AgridataStateService } from '@/entities/api/agridata-state.service';
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
    RouterModule,
    HeaderWidgetComponent,
    NavigationWidgetComponent,
    FooterWidgetComponent,
    ToastComponent,
    SupporterOverlayComponent,
    CookiebannerComponent,
    NewYearBannerComponent,
  ],
  templateUrl: './default-layout.component.html',
})
export class DefaultLayoutComponent {
  protected readonly agridataStateService = inject(AgridataStateService);

  protected readonly showCookieBanner = computed(() =>
    this.agridataStateService.showCookiebanner(),
  );
}
