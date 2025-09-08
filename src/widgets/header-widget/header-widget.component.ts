import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { LanguageSelectComponent } from '@/features/language-select';
import { I18nPipe } from '@/shared/i18n';
import { AuthService } from '@/shared/lib/auth';
import { ButtonComponent, ButtonVariants } from '@/shared/ui/button';
import { AccountOverlayComponent } from '@/widgets/account-overlay';
import { ContactSupportInfoComponent } from '@/widgets/contact-support-info';
import { NavigationWidgetComponent } from '@/widgets/navigation-widget';

/**
 * Implements the header logic. It renders the application logo, includes language selection, and
 * conditionally shows the account overlay or login button depending on authentication state. It
 * integrates authentication services and ensures reactive updates when user data changes.
 *
 * CommentLastReviewed: 2025-09-08
 */
@Component({
  selector: 'app-header-widget',
  imports: [
    RouterLink,
    LanguageSelectComponent,
    I18nPipe,
    AccountOverlayComponent,
    NavigationWidgetComponent,
    ButtonComponent,
    ContactSupportInfoComponent,
  ],
  templateUrl: './header-widget.component.html',
  styleUrl: './header-widget.component.css',
})
export class HeaderWidgetComponent {
  private readonly authService = inject(AuthService);

  readonly isAuthenticated = computed(() => this.authService.isAuthenticated());
  readonly userData = computed(() => this.authService.userData());

  readonly ButtonVariants = ButtonVariants;

  login = () => {
    this.authService.login();
  };
}
