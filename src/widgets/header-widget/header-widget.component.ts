import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { LanguageSelectComponent } from '@/features/language-select/language-select.component';
import { AuthService } from '@/shared/lib/auth';

@Component({
  selector: 'app-header-widget',
  imports: [RouterLink, LanguageSelectComponent],
  templateUrl: './header-widget.component.html',
  styleUrl: './header-widget.component.css',
})
export class HeaderWidgetComponent {
  private readonly authService = inject(AuthService);

  readonly isAuthenticated = computed(() => this.authService.isAuthenticated());
  readonly userData = computed(() => this.authService.userData());

  login = () => {
    this.authService.login();
  };

  logout = () => {
    this.authService.logout();
  };
}
