import { Component, HostListener, inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';

import { AuthService } from '@/shared/lib/auth';

/**
 * The root Angular component that renders the application shell. It provides the router outlet as
 * the placeholder for dynamic routes.
 *
 * CommentLastReviewed: 2025-10-03
 */
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
  imports: [RouterOutlet],
})
export class AppComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  @HostListener('window:focus')
  onWindowFocus() {
    // Check authentication status when window regains focus
    this.authService.checkAuth();

    if (this.authService.isAuthenticated()) {
      // reload the page if on the default route to trigger our home-redirect guard
      if (this.router.url === '/') {
        globalThis.location.reload();
      }
    }
  }
}
