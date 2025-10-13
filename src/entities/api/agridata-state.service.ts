import { Injectable, signal } from '@angular/core';

import { UidDto } from '@/entities/openapi';
import {
  ACTIVE_UID_FIELD,
  KTIDP_IMPERSONATION_QUERY_PARAM,
  NAVIGATION_STATE_OPEN,
} from '@/shared/constants/constants';

/**
 * Centralized state service for managing active and available UIDs. Persists the currently active
 * UID in local storage and exposes signals for reactive updates to active UID, available UIDs,
 * and load status.
 *
 * CommentLastReviewed: 2025-08-25
 */
@Injectable({
  providedIn: 'root',
})
export class AgridataStateService {
  readonly activeUid = signal<string | undefined>(this.getStoredUid());
  readonly userUids = signal<UidDto[]>([]);
  readonly userUidsLoaded = signal(false);
  readonly isNavigationOpen = signal(this.getNavigationStateOpen());

  private getStoredUid(): string | undefined {
    return localStorage.getItem(ACTIVE_UID_FIELD) as string | undefined;
  }

  private getNavigationStateOpen() {
    return localStorage.getItem(NAVIGATION_STATE_OPEN) === 'true';
  }

  setActiveUid(uid: string) {
    localStorage.setItem(ACTIVE_UID_FIELD, uid);
    this.activeUid.set(uid);
  }

  setUids(uids: UidDto[]) {
    if (uids && Array.isArray(uids)) {
      this.userUidsLoaded.set(true);
      this.userUids.set(uids);
    }
  }

  setNavigationState(isOpen: boolean) {
    localStorage.setItem(NAVIGATION_STATE_OPEN, String(isOpen));
    this.isNavigationOpen.set(isOpen);
  }

  getDefaultUid(uids: UidDto[]) {
    const storedUid = this.activeUid();
    if (storedUid && uids.some((uid) => uid.uid === storedUid)) {
      return storedUid;
    }
    return uids.length > 0 && uids[0].uid ? uids[0].uid : null;
  }

  isImpersonating(): boolean {
    return sessionStorage.getItem(KTIDP_IMPERSONATION_QUERY_PARAM) !== null;
  }
}
