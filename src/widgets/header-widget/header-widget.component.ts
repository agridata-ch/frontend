import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { LanguageSelectComponent } from '@/features/language-select';
import { I18nPipe } from '@/shared/i18n';
import { AuthService } from '@/shared/lib/auth';
import { AccountOverlayComponent } from '@/widgets/account-overlay';

@Component({
  selector: 'app-header-widget',
  imports: [RouterLink, LanguageSelectComponent, I18nPipe, AccountOverlayComponent],
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
}
