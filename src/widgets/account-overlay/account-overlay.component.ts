import { Component, computed, effect, inject, input, signal } from '@angular/core';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons';

import { AgridataStateService } from '@/entities/api/agridata-state.service';
import { ParticipantService } from '@/entities/api/participant.service';
import { UidDto } from '@/entities/openapi';
import { ClickOutsideDirective } from '@/shared/click-outside/click-outside.directive';
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
  readonly participantService = inject(ParticipantService);
  readonly agridataStateService = inject(AgridataStateService);

  readonly userData = input<UserData | null>(null);
  readonly ButtonVariants = ButtonVariants;
  readonly AvatarSize = AvatarSize;
  readonly AvatarSkin = AvatarSkin;

  readonly isOverlayOpen = signal(false);
  readonly selectedUid = signal<string | null>(null);

  readonly initials = computed(() => this.getInitials(this.userData()?.name));
  readonly dropdownIcon = computed(() => {
    return this.isOverlayOpen() ? faChevronUp : faChevronDown;
  });
  readonly activeUid = computed(() => {
    const selectedUid = this.selectedUid();
    if (selectedUid) {
      return selectedUid;
    }
    return this.getDefaultUid(this.authorizedUids());
  });
  readonly authorizedUids = computed(() => {
    const authorizedUids = this.participantService.getAuthorizedUids;

    if (authorizedUids.isLoading() || authorizedUids.error()) {
      return [];
    }
    return Array.isArray(authorizedUids.value())
      ? authorizedUids.value().sort(this.sortAlphabetically)
      : [];
  });

  activeUidEffect = effect(() => {
    const activeUid = this.activeUid();
    if (activeUid) {
      this.agridataStateService.setActiveUid(activeUid);
    }
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

  private getDefaultUid(uids: UidDto[]) {
    const storedUid = this.agridataStateService.uidSignal();
    if (storedUid && uids.some((uid) => uid.uid === storedUid)) {
      return storedUid;
    }
    return uids.length > 0 && uids[0].uid ? uids[0].uid : null;
  }

  logout = () => {
    this.authService.logout();
  };

  getInitials(fullName: string | undefined) {
    if (!fullName) return '';
    const tokens = fullName.trim().split(/\s+/);
    if (tokens.length === 0) return '';
    const first = tokens[0][0] || '';
    const last = tokens.length > 1 ? tokens.at(-1)?.[0] : '';
    return (first + last).toUpperCase();
  }

  toggleOverlay() {
    this.isOverlayOpen.set(!this.isOverlayOpen());
  }

  selectUid(uid: string | undefined) {
    if (uid) this.selectedUid.set(uid);
  }

  handleClickOutside() {
    this.isOverlayOpen.set(false);
  }
}
