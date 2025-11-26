import { Location } from '@angular/common';
import { Component, computed, inject, input, signal } from '@angular/core';

import { AgridataStateService } from '@/entities/api/agridata-state.service';
import { UidDto } from '@/entities/openapi';
import { ROUTE_PATHS } from '@/shared/constants/constants';
import { AuthService } from '@/shared/lib/auth';
import { AgridataAvatarComponent, AvatarSize, AvatarSkin } from '@/shared/ui/agridata-avatar';

import { UidSwitchVariant } from './uid-switch.model';

/**
 * Implements the UID switch logic and presentation. It allows users to switch between different UIDs,
 * displays the currently selected UID, and provides a way to select a new UID. The component manages
 * the selected UID state and ensures UIDs are sorted consistently.
 *
 * CommentLastReviewed: 2025-08-25
 */
@Component({
  selector: 'app-uid-switch',
  imports: [AgridataAvatarComponent],
  templateUrl: './uid-switch.component.html',
})
export class UidSwitchComponent {
  readonly agridataStateService = inject(AgridataStateService);
  readonly location = inject(Location);
  readonly authService = inject(AuthService);
  readonly additionalClass = input<string | null>(null);

  readonly variant = input<UidSwitchVariant>(UidSwitchVariant.Light);

  readonly selectedUid = signal<string | null>(null);

  readonly sortedUids = computed(() => this.authService.userUids().sort(this.sortAlphabetically));
  readonly activeUid = computed(() => {
    const selectedUid = this.selectedUid();
    if (selectedUid) {
      return selectedUid;
    }
    return this.agridataStateService.activeUid();
  });

  readonly UidSwitchVariant = UidSwitchVariant;
  readonly AvatarSize = AvatarSize;
  readonly AvatarSkin = AvatarSkin;

  sortAlphabetically(uidA: UidDto | undefined, uidB: UidDto | undefined) {
    if (!uidA?.name) {
      return 1; // Place undefined UIDs at the end
    }
    if (!uidB?.name) {
      return -1;
    }
    return uidA.name.toLowerCase().localeCompare(uidB.name.toLowerCase());
  }

  selectUid(uid: string | undefined) {
    if (uid) {
      this.agridataStateService.setActiveUid(uid);
      this.location.go(`${ROUTE_PATHS.CONSENT_REQUEST_PRODUCER_PATH}/${uid}`);
    }
  }
}
