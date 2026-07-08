import { computed, effect, inject, Service, signal } from '@angular/core';
import { Router } from '@angular/router';
import { OidcSecurityService } from 'angular-auth-oidc-client';
import { lastValueFrom } from 'rxjs';

import { UserService } from '@/entities/api/user.service';
import { UidDto, UserInfoDto } from '@/entities/openapi';
import {
  ActingRole,
  AGATE_LOGIN_ID_IMPERSONATION_HEADER,
  USER_ROLES,
} from '@/shared/constants/constants';

/**
 * Manages authentication state, user profile data, and role extraction from user info. Provides login,
 * logout, and authentication status monitoring with reactive signals.
 *
 * CommentLastReviewed: 2026-04-22
 */
@Service()
export class AuthService {
  // Injects
  private readonly oidcService = inject(OidcSecurityService);
  private readonly router = inject(Router);
  private readonly userService = inject(UserService);

  // Signals
  private readonly _isAuthenticated = signal<boolean>(false);
  // Whether this application load originated from an OIDC login callback (fresh login) rather than a
  // page refresh or silent token renew. A construction-time snapshot of the callback query params —
  // it must NOT be reset by `resetUserInfoEffect`, whose first run happens before `checkAuth()`
  // resolves (while `_isAuthenticated` is still false) and would otherwise wipe a genuine fresh login.
  private readonly _justLoggedIn = signal<boolean>(this.isLoginCallbackUrl());
  private readonly _userInfo = signal<UserInfoDto | undefined>(undefined);
  private readonly _userRoles = signal<string[]>([]);
  private readonly _userUids = signal<UidDto[]>([]);

  readonly isAuthenticated = this._isAuthenticated.asReadonly();
  readonly justLoggedIn = this._justLoggedIn.asReadonly();
  readonly userInfo = this._userInfo.asReadonly();
  readonly userRoles = this._userRoles.asReadonly();
  readonly userUids = this._userUids.asReadonly();

  // Computed Signals
  readonly isConsumer = computed(
    () => this.userRoles()?.includes(USER_ROLES.AGRIDATA_DATA_REQUESTS_CONSUMER) ?? false,
  );
  readonly isDataProvider = computed(
    () => this.userRoles()?.includes(USER_ROLES.AGRIDATA_DATA_REQUESTS_PROVIDER) ?? false,
  );
  readonly isProducer = computed(
    () => this.userRoles()?.includes(USER_ROLES.AGRIDATA_CONSENT_REQUESTS_PRODUCER) ?? false,
  );
  readonly isSupporter = computed(
    () => this.userRoles()?.includes(USER_ROLES.AGRIDATA_SUPPORTER) ?? false,
  );
  readonly isAdmin = computed(() => this.userRoles()?.includes(USER_ROLES.AGRIDATA_ADMIN) ?? false);
  readonly isImpersonating = computed(
    () => sessionStorage.getItem(AGATE_LOGIN_ID_IMPERSONATION_HEADER) !== null,
  );
  readonly hasMobileNumber = computed(() => !!this.userInfo()?.mobileNumber);

  // Effects
  private readonly resetUserInfoEffect = effect(() => {
    if (!this.isAuthenticated()) {
      this._userInfo.set(undefined);
      this._userRoles.set([]);
      this._userUids.set([]);
      this.authCheckPromise = undefined;
      this.hasRedirectedAfterLogin = false;
      this.userInfoPromise = undefined;
      this.userUidsPromise = undefined;
    }
  });

  // Private properties
  private authCheckPromise?: Promise<{ isAuthenticated: boolean }>;
  private hasRedirectedAfterLogin = false;
  private userInfoPromise?: Promise<UserInfoDto | undefined>;
  private userUidsPromise?: Promise<UidDto[]>;

  getUserEmail(): string {
    return this.userInfo()?.email ?? '';
  }

  getUserFullName(): string {
    const info = this.userInfo();
    return [info?.givenName, info?.familyName].filter(Boolean).join(' ');
  }

  getUserId(): string | undefined {
    return this.userInfo()?.userId;
  }

  async initializeAuth(): Promise<boolean> {
    // Cache the OIDC checkAuth call to prevent multiple simultaneous calls
    this.authCheckPromise ??= lastValueFrom(this.oidcService.checkAuth());

    const { isAuthenticated } = await this.authCheckPromise;

    // Only skip re-initialization if we're authenticated AND already have roles loaded
    if (isAuthenticated && this.isAuthenticated() && this.userRoles().length > 0) {
      return true;
    }

    // If authentication state changed, reset the promise cache
    if (isAuthenticated !== this.isAuthenticated()) {
      this.userInfoPromise = undefined;
      this.userUidsPromise = undefined;
    }

    this._isAuthenticated.set(isAuthenticated);

    if (!isAuthenticated) {
      this._userInfo.set(undefined);
      this._userRoles.set([]);
      return false;
    }

    this.userInfoPromise ??= lastValueFrom(this.userService.getUserInfo());
    const userInfo = await this.userInfoPromise;
    this._userInfo.set(userInfo);

    this._userRoles.set(userInfo?.rolesAtLastLogin ?? []);
    return true;
  }

  /**
   * Initializes and retrieves the authorized UIDs for the authenticated user.
   * Ensures that user is authenticated and user info is loaded. Caches uid information preventing unnecessary API call.
   * Intended to be used by guards (that run in parallel), preventing multiple API calls.
   *
   * @returns A promise emitting an array of authorized UIDs.
   */
  async initializeAuthorizedUids(): Promise<UidDto[]> {
    await this.initializeAuth();

    if (this.shouldSkipAuthorizedUids()) {
      throw new Error('user does not have correct role to fetch authorized uids');
    }

    const cachedUids = this.userUids();
    if (cachedUids.length > 0) {
      return cachedUids;
    }

    this.userUidsPromise ??= lastValueFrom(
      this.userService.getAuthorizedUids(this.resolveUidActingRole()),
    );
    const promise = this.userUidsPromise; // capture before cache may be cleared mid-flight
    const uids = await promise;
    this._userUids.set(uids);

    return uids;
  }

  clearAuthorizedUidsCache(): void {
    this.userUidsPromise = undefined;
  }

  login(): void {
    this.oidcService.authorize();
  }

  async logout(): Promise<void> {
    await lastValueFrom(this.oidcService.logoff());
    await this.router.navigate(['/']);
  }

  /**
   * Re-fetches the current user info and updates the authoritative signals. Used after actions that
   * change server-side user state (e.g. accepting the AGB) so reactive consumers observe the change.
   */
  async refreshUserInfo(): Promise<void> {
    this.userInfoPromise = lastValueFrom(this.userService.getUserInfo());
    const userInfo = await this.userInfoPromise;
    this._userInfo.set(userInfo);
    this._userRoles.set(userInfo?.rolesAtLastLogin ?? []);
  }

  private isLoginCallbackUrl(): boolean {
    const params = new URLSearchParams(window.location.search);
    return params.has('code') && params.has('state');
  }

  private resolveUidActingRole(): ActingRole {
    if (this.isImpersonating()) return 'SUPPORT';
    if (this.isProducer()) return 'PRODUCER';
    return undefined as unknown as ActingRole; // Let API default to consumer role if not producer/support
  }

  private shouldSkipAuthorizedUids(): boolean {
    if (!this.isAuthenticated()) return true;
    if (this.isProducer()) return false;

    return !(this.isSupporter() && this.isImpersonating());
  }
}
