import { Injectable, signal } from '@angular/core';

import { ACTIVE_UID_FIELD } from '@/shared/constants/constants';

@Injectable({
  providedIn: 'root',
})
export class AgridataStateService {
  readonly uidSignal = signal<string | null>(localStorage.getItem(ACTIVE_UID_FIELD) || null);

  setActiveUid(uid: string) {
    localStorage.setItem(ACTIVE_UID_FIELD, uid);
    this.uidSignal.set(uid);
  }
}
