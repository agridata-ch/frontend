import { Location } from '@angular/common';
import { Component, computed, inject, input, signal } from '@angular/core';
import { faChevronDown, faChevronUp } from '@awesome.me/kit-0b6d1ed528/icons/classic/regular';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';

import { AgridataStateService } from '@/entities/api/agridata-state.service';
import { UserInfoDto } from '@/entities/openapi';
import { ClickOutsideDirective } from '@/shared/click-outside/click-outside.directive';
import { I18nPipe } from '@/shared/i18n';
import { AuthService } from '@/shared/lib/auth';
import { AgridataAvatarComponent, AvatarSize, AvatarSkin } from '@/shared/ui/agridata-avatar';
import { ButtonComponent, ButtonVariants } from '@/shared/ui/button';
import { PopoverComponent } from '@/shared/ui/popover/popover.component';
import { UidSwitchComponent } from '@/widgets/uid-switch';

/**
 * Implements the account overlay logic and presentation. It displays the authenticated user’s name,
 * email, and available UIDs, supports UID selection with automatic navigation updates, and provides
 * a logout action. The component manages open/close state, click-outside handling, and ensures UIDs
 * are sorted consistently.
 *
 * CommentLastReviewed: 2025-08-25
 */
@Component({
  selector: 'app-account-overlay',
  imports: [
    I18nPipe,
    ButtonComponent,
    FaIconComponent,
    PopoverComponent,
    ClickOutsideDirective,
    AgridataAvatarComponent,
    UidSwitchComponent,
  ],
  templateUrl: './account-overlay.component.html',
})
export class AccountOverlayComponent {
  readonly authService = inject(AuthService);
  readonly agridataStateService = inject(AgridataStateService);
  readonly location = inject(Location);

  readonly userInfo = input<UserInfoDto | undefined>(undefined);
  readonly overlayName = computed(() => {
    return this.authService.getUserFullName();
  });

  readonly ButtonVariants = ButtonVariants;
  readonly AvatarSize = AvatarSize;
  readonly AvatarSkin = AvatarSkin;

  readonly isOverlayOpen = signal(false);

  readonly dropdownIcon = computed(() => {
    return this.isOverlayOpen() ? faChevronUp : faChevronDown;
  });
  readonly activeUid = computed(() => {
    return this.agridataStateService.activeUid();
  });

  logout = () => {
    this.authService.logout();
  };

  toggleOverlay() {
    this.isOverlayOpen.set(!this.isOverlayOpen());
  }

  handleClickOutside() {
    this.isOverlayOpen.set(false);
  }
}
