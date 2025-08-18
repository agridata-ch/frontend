import { Location } from '@angular/common';
import { Component, computed, inject, input, signal } from '@angular/core';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons';

import { AgridataStateService } from '@/entities/api/agridata-state.service';
import { UidDto } from '@/entities/openapi';
import { ClickOutsideDirective } from '@/shared/click-outside/click-outside.directive';
import { ROUTE_PATHS } from '@/shared/constants/constants';
import { I18nPipe } from '@/shared/i18n';
import { AuthService, UserData } from '@/shared/lib/auth';
import { AgridataAvatarComponent, AvatarSize, AvatarSkin } from '@/shared/ui/agridata-avatar';
import { ButtonComponent, ButtonVariants } from '@/shared/ui/button';
import { PopoverComponent } from '@/shared/ui/popover/popover.component';

@Component({
  selector: 'app-account-overlay',
  imports: [
    I18nPipe,
    ButtonComponent,
    FaIconComponent,
    PopoverComponent,
    ClickOutsideDirective,
    AgridataAvatarComponent,
  ],
  templateUrl: './account-overlay.component.html',
})
export class AccountOverlayComponent {
  readonly authService = inject(AuthService);
  readonly agridataStateService = inject(AgridataStateService);
  readonly location = inject(Location);
  readonly userData = input<UserData | null>(null);
  readonly overlayName = computed(() => {
    return this.authService.getUserFullName();
  });

  readonly ButtonVariants = ButtonVariants;
  readonly AvatarSize = AvatarSize;
  readonly AvatarSkin = AvatarSkin;

  readonly isOverlayOpen = signal(false);
  readonly selectedUid = signal<string | null>(null);
  readonly sortedUids = computed(() =>
    this.agridataStateService.userUids().sort(this.sortAlphabetically),
  );

  readonly dropdownIcon = computed(() => {
    return this.isOverlayOpen() ? faChevronUp : faChevronDown;
  });
  readonly activeUid = computed(() => {
    const selectedUid = this.selectedUid();
    if (selectedUid) {
      return selectedUid;
    }
    return this.agridataStateService.activeUid();
  });

  sortAlphabetically(uidA: UidDto | undefined, uidB: UidDto | undefined) {
    if (!uidA?.name) {
      return 1; // Place undefined UIDs at the end
    }
    if (!uidB?.name) {
      return -1;
    }
    return uidA.name.toLowerCase().localeCompare(uidB.name.toLowerCase());
  }

  logout = () => {
    this.authService.logout();
  };

  toggleOverlay() {
    this.isOverlayOpen.set(!this.isOverlayOpen());
  }

  selectUid(uid: string | undefined) {
    if (uid) {
      this.agridataStateService.setActiveUid(uid);
      this.location.go(`${ROUTE_PATHS.CONSENT_REQUEST_PRODUCER_PATH}/${uid}`);
    }
  }

  handleClickOutside() {
    this.isOverlayOpen.set(false);
  }
}
