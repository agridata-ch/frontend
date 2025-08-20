import { Injectable, signal } from '@angular/core';

import { UidDto } from '@/entities/openapi';
import { ACTIVE_UID_FIELD } from '@/shared/constants/constants';

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
  readonly activeUid = signal<string | null>(this.getStoredUid());
  readonly userUids = signal<UidDto[]>([]);
  readonly userUidsLoaded = signal(false);

  private getStoredUid(): string | null {
    return localStorage.getItem(ACTIVE_UID_FIELD);
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

  getDefaultUid(uids: UidDto[]) {
    const storedUid = this.activeUid();
    if (storedUid && uids.some((uid) => uid.uid === storedUid)) {
      return storedUid;
    }
    return uids.length > 0 && uids[0].uid ? uids[0].uid : null;
  }
}
