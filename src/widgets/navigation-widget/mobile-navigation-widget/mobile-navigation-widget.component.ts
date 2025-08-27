import { Component, computed, inject, signal } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faCircleQuestion } from '@fortawesome/free-regular-svg-icons';
import { faBars, faBell, faClose, faHome } from '@fortawesome/free-solid-svg-icons';

import { AgridataStateService } from '@/entities/api/agridata-state.service';
import { LanguageSelectComponent } from '@/features/language-select';
import { I18nPipe } from '@/shared/i18n';
import { AuthService } from '@/shared/lib/auth';
import { AgridataAvatarComponent, AvatarSize } from '@/shared/ui/agridata-avatar';
import { ButtonComponent, ButtonVariants } from '@/shared/ui/button';
import { UidSwitchComponent, UidSwitchVariant } from '@/widgets/uid-switch';

/**
 *
 * Mobile navigation widget that provides a responsive menu for mobile users.
 *
 * CommentLastReviewed: 2025-08-25
 */
@Component({
  selector: 'app-mobile-navigation-widget',
  imports: [
    FontAwesomeModule,
    LanguageSelectComponent,
    ButtonComponent,
    I18nPipe,
    AgridataAvatarComponent,
    UidSwitchComponent,
  ],
  templateUrl: './mobile-navigation-widget.component.html',
})
export class MobileNavigationWidgetComponent {
  readonly authService = inject(AuthService);
  readonly agridataStateService = inject(AgridataStateService);

  readonly isNavigationOpen = signal(false);

  readonly overlayName = computed(() => {
    return this.authService.getUserFullName();
  });
  readonly isAuthenticated = computed(() => this.authService.isAuthenticated());
  readonly activeUid = computed(() => {
    return this.agridataStateService.activeUid();
  });

  readonly menuIcon = faBars;
  readonly closeIcon = faClose;
  readonly supportIcon = faCircleQuestion;
  readonly notificationIcon = faBell;
  readonly homeIcon = faHome;
  readonly ButtonVariants = ButtonVariants;
  readonly AvatarSize = AvatarSize;
  readonly UidSwitchVariant = UidSwitchVariant;

  toggleNavigation = () => {
    this.isNavigationOpen.set(!this.isNavigationOpen());
  };
}
