import { CommonModule } from '@angular/common';
import { Component, computed, inject, ViewEncapsulation } from '@angular/core';
import { RouterModule } from '@angular/router';

import { AgridataStateService } from '@/entities/api/agridata-state.service';
import { ToastComponent } from '@/shared/ui/toast';
import { CookiebannerComponent } from '@/widgets/cookiebanner';
import { FooterWidgetComponent } from '@/widgets/footer-widget';
import { HeaderWidgetComponent } from '@/widgets/header-widget';
import { NewYearBannerComponent } from '@/widgets/new-year-banner';

/**
 * Provides a full-width layout with header, footer, and content area. It disables view
 * encapsulation to allow CMS-driven styling overrides.
 *
 * CommentLastReviewed: 2025-08-25
 */
@Component({
  selector: 'app-full-width-layout',
  imports: [
    CommonModule,
    RouterModule,
    HeaderWidgetComponent,
    FooterWidgetComponent,
    ToastComponent,
    CookiebannerComponent,
    NewYearBannerComponent,
  ],
  templateUrl: './full-width-layout.component.html',
  styleUrls: ['./full-width-layout.component.css'],
  // Disable view encapsulation for CMS content.
  // This is neccessary because we want to overwrite global variables for every child component
  encapsulation: ViewEncapsulation.None,
})
export class FullWidthLayoutComponent {
  protected readonly agridataStateService = inject(AgridataStateService);

  protected readonly showCookieBanner = computed(() =>
    this.agridataStateService.showCookiebanner(),
  );
}
