import { CommonModule } from '@angular/common';
import { Component, ViewEncapsulation, effect, inject } from '@angular/core';
import { RouterModule } from '@angular/router';

import { AuthService } from '@/shared/lib/auth';
import { ToastComponent } from '@/shared/ui/toast';
import { FooterWidgetComponent } from '@/widgets/footer-widget';
import { HeaderWidgetComponent } from '@/widgets/header-widget';

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
  ],
  templateUrl: './full-width-layout.component.html',
  styleUrls: ['./full-width-layout.component.css'],
  // Disable view encapsulation for CMS content.
  // This is neccessary because we want to overwrite global variables for every child component
  encapsulation: ViewEncapsulation.None,
})
export class FullWidthLayoutComponent {
  private readonly authService = inject(AuthService);

  private readonly authStateEffect = effect(() => {
    const prevAuth = this.authService.isAuthenticated();
    if (prevAuth) {
      globalThis.location.reload();
    }
  });
}
