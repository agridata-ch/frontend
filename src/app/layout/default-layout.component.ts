import { CommonModule } from '@angular/common';
import { Component, effect, inject } from '@angular/core';
import { RouterModule } from '@angular/router';

import { AuthService } from '@/shared/lib/auth';
import { ToastComponent } from '@/shared/ui/toast';
import { FooterWidgetComponent } from '@/widgets/footer-widget';
import { HeaderWidgetComponent } from '@/widgets/header-widget';
import { NavigationWidgetComponent } from '@/widgets/navigation-widget';

/**
 * Provides a layout with header, navigation, footer, and toast notifications. It reacts to
 * authentication state changes to refresh the application when users log out or log back in.
 *
 * CommentLastReviewed: 2025-08-25
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
  ],
  templateUrl: './default-layout.component.html',
})
export class DefaultLayoutComponent {
  private readonly authService = inject(AuthService);
  constructor() {
    // Refresh the page when the authentication state changes
    // This is useful for cases where the user logs in or out in a different tab
    let prev = this.authService.isAuthenticated();
    effect(() => {
      const curr = this.authService.isAuthenticated();
      if (prev && !curr) {
        window.location.reload();
      }
      prev = curr;
    });
  }
}
