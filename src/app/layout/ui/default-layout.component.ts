import { Component, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { ToastComponent } from '@/shared/ui/toast/toast.component';
import { HeaderWidgetComponent } from '@widgets/header-widget/header-widget.component';
import { FooterWidgetComponent } from '@widgets/footer-widget/footer-widget.component';
import { NavigationWidgetComponent } from '@widgets/navigation-widget/navigation-widget.component';
import { AuthService } from '@/shared/services/auth.service';

@Component({
  standalone: true,
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
  styleUrls: ['./default-layout.component.css'],
})
export class DefaultLayoutComponent {
  constructor(private readonly authService: AuthService) {
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

  ngOnInit() {
    this.authService.checkAuth();
  }
}
