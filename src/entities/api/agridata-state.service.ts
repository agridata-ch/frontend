import { Injectable, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, NavigationStart, Router } from '@angular/router';
import { filter, map } from 'rxjs';

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
  private readonly router = inject(Router);

  readonly activeUid = signal<string | undefined>(this.getStoredUid());
  readonly userUids = signal<UidDto[]>([]);
  readonly userUidsLoaded = signal(false);
  readonly isNavigationOpen = signal(this.getNavigationStateOpen());
  readonly currentRoute = toSignal(
    this.router.events.pipe(
      filter((event) => event instanceof NavigationEnd),
      map(() => this.extractRoutePath()),
    ),
  );

  readonly routeStart = toSignal(
    this.router.events.pipe(
      filter((event) => event instanceof NavigationStart),
      map((event) => event.url),
    ),
  );

  readonly currentRouteWithoutQueryParams = computed(() => {
    const route = this.currentRoute();
    if (!route) {
      return undefined;
    }
    return route.split('?')[0];
  });

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

  private getStoredUid(): string | undefined {
    return localStorage.getItem(ACTIVE_UID_FIELD) as string | undefined;
  }

  private getNavigationStateOpen() {
    return localStorage.getItem(NAVIGATION_STATE_OPEN) === 'true';
  }

  /**
   * Extracts the route path from the current URL, excluding query parameters.
   * @returns The current route path without query parameters
   */
  private extractRoutePath(): string {
    return this.router.url;
  }
}
