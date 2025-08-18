import { Injectable, signal } from '@angular/core';

import { UidDto } from '@/entities/openapi';
import { ACTIVE_UID_FIELD } from '@/shared/constants/constants';

@Injectable({
  providedIn: 'root',
})
export class AgridataStateService {
  readonly activeUid = signal<string | null>(localStorage.getItem(ACTIVE_UID_FIELD) || null);
  readonly userUids = signal<UidDto[]>([]);
  readonly userUidsLoaded = signal(false);

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
