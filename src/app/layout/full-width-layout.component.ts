import { CommonModule } from '@angular/common';
import { Component, ViewEncapsulation, effect, inject } from '@angular/core';
import { RouterModule } from '@angular/router';

import { AuthService } from '@/shared/lib/auth';
import { ToastComponent } from '@/shared/ui/toast';
import { FooterWidgetComponent } from '@/widgets/footer-widget';
import { HeaderWidgetComponent } from '@/widgets/header-widget';

@Component({
  standalone: true,
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
