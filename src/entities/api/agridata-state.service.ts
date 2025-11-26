import { Injectable, computed, inject, signal, effect } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  NavigationCancel,
  NavigationEnd,
  NavigationSkipped,
  NavigationStart,
  Router,
} from '@angular/router';
import { filter, map } from 'rxjs';

import { BackendInfoService } from '@/entities/api/backend-info.service';
import { UserService } from '@/entities/api/user.service';
import { UidDto, UserPreferencesDto } from '@/entities/openapi';
import {
  ACTIVE_UID_FIELD,
  KTIDP_IMPERSONATION_QUERY_PARAM,
  NAVIGATION_STATE_OPEN,
  ROUTE_PATHS,
} from '@/shared/constants/constants';
import { AuthService } from '@/shared/lib/auth';

export const DISMISSED_MIGRATIONS_KEY = 'dismissedMigrationAlerts';
const BACKEND_INFO_ROUTE_BLACKLIST = ['/', `/${ROUTE_PATHS.MAINTENANCE}`];

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
  // Injectes
  private readonly router = inject(Router);
  private readonly userService = inject(UserService);
  private readonly authService = inject(AuthService);
  private readonly backendInfoService = inject(BackendInfoService);

  // Signals
  private readonly _userPreferences = signal<UserPreferencesDto>({}); // we want to locally track changes before persisting
  private readonly _backendInfo = signal<{ [key: string]: string } | undefined>(undefined);

  readonly userPreferences = this._userPreferences.asReadonly();
  readonly isNavigationOpen = signal(this.getNavigationStateOpen());
  readonly backendInfo = this._backendInfo.asReadonly();
  readonly currentRoute = toSignal(
    this.router.events.pipe(
      filter((event) => event instanceof NavigationEnd),
      map(() => this.extractRoutePath()),
    ),
  );
  readonly routeStart = toSignal(
    this.router.events.pipe(
      filter(
        (event) =>
          event instanceof NavigationStart ||
          event instanceof NavigationCancel ||
          event instanceof NavigationSkipped,
      ),
      map((event) => event.url),
    ),
  );

  // Computed signals
  readonly activeUid = computed<string | undefined>(() => this._userPreferences()?.activeUid);

  readonly currentRouteWithoutQueryParams = computed(() => {
    const route = this.currentRoute();
    if (!route) {
      return undefined;
    }
    return route.split('?')[0];
  });

  // Effects
  private readonly initUserPreferences = effect(() => {
    const userInfo = this.authService.userInfo();
    if (userInfo) {
      this._userPreferences.set(
        this.authService.userInfo()?.userPreferences ?? {
          mainMenuOpened: false,
          dismissedMigratedIds: [],
        },
      );
      // todo remove migration from local storage after some time DIGIB2-1050
      const previousStoredUids = localStorage.getItem(DISMISSED_MIGRATIONS_KEY);
      if (previousStoredUids) {
        if (Array.isArray(JSON.parse(previousStoredUids))) {
          this.addConfirmedMigratedUids(JSON.parse(previousStoredUids) as string[]);
        }
        localStorage.removeItem(DISMISSED_MIGRATIONS_KEY);
      }
    }
  });

  private readonly loadBackendInfoEffect = effect(() => {
    const route = this.currentRouteWithoutQueryParams();
    if (route && !this._backendInfo() && this.shouldLoadBackendInfo(route)) {
      this.backendInfoService
        .fetchBackendInfo()
        .then((version) => this._backendInfo.set(version))
        .catch((err) => console.error(err));
    }
  });

  setActiveUid(activeUid: string) {
    if (activeUid !== this.activeUid()) {
      this._userPreferences.update((prefs) => ({
        ...prefs,
        activeUid,
      }));
      this.userService.updateUserPreferences(this._userPreferences()).then();
    }
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

  setMainMenuOpened(mainMenuOpened: boolean) {
    this._userPreferences.update((prefs) => ({
      ...prefs,
      mainMenuOpened,
    }));
    this.userService.updateUserPreferences(this._userPreferences()).then();
  }

  addConfirmedMigratedUids(confirmedUids: string[]) {
    this._userPreferences.update((prefs) => {
      const dismissedMigratedIds = prefs.dismissedMigratedIds || [];
      confirmedUids.forEach((id) => dismissedMigratedIds.push(id));
      return {
        ...prefs,
        dismissedMigratedIds,
      };
    });
    this.userService.updateUserPreferences(this._userPreferences()).then();
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

  private shouldLoadBackendInfo(route: string) {
    return !BACKEND_INFO_ROUTE_BLACKLIST.includes(route);
  }
}
