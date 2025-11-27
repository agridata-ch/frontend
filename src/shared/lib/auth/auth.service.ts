import { DestroyRef, Injectable, computed, effect, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { OidcSecurityService } from 'angular-auth-oidc-client';
import { mergeMap, of, shareReplay, tap, throwError } from 'rxjs';
import { map } from 'rxjs/operators';

import { UserService } from '@/entities/api/user.service';
import { UidDto, UserInfoDto } from '@/entities/openapi';
import { KTIDP_IMPERSONATION_QUERY_PARAM, USER_ROLES } from '@/shared/constants/constants';

/**
 * Manages authentication state, user profile data, and role extraction from tokens. Provides login,
 * logout, and authentication status monitoring with reactive signals.
 *
 * CommentLastReviewed: 2025-10-06
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly oidcService = inject(OidcSecurityService);
  private readonly userService = inject(UserService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  private readonly _isAuthenticated = signal<boolean>(false);
  private readonly _userInfo = signal<UserInfoDto | undefined>(undefined);
  private readonly _userRoles = signal<string[]>([]);
  private readonly _userUids = signal<UidDto[]>([]);

  readonly isAuthenticated = this._isAuthenticated.asReadonly();
  readonly userInfo = this._userInfo.asReadonly();
  readonly userRoles = this._userRoles.asReadonly();
  readonly userUids = this._userUids.asReadonly();

  readonly isProducer = computed(
    () => this.userRoles()?.includes(USER_ROLES.AGRIDATA_CONSENT_REQUESTS_PRODUCER) ?? false,
  );
  readonly isConsumer = computed(
    () => this.userRoles()?.includes(USER_ROLES.AGRIDATA_DATA_REQUESTS_CONSUMER) ?? false,
  );

  readonly isSupporter = computed(
    () => this.userRoles()?.includes(USER_ROLES.AGRIDATA_SUPPORTER) ?? false,
  );

  private readonly resetUserInfoEffect = effect(() => {
    if (!this.isAuthenticated()) {
      this._userRoles.set([]);
      this._userInfo.set(undefined);
    }
  });

  private readonly userInfo$ = this.userService.getUserInfo().pipe(
    tap((userInfo) => {
      this._userInfo.set(userInfo);
    }),
    // cache the result as long as at least one subscriber exists (angular router does not seem to unsubscribe on navigation so it will keep state until page reload)
    shareReplay({ bufferSize: 1, refCount: false }),
  );

  private readonly authorizedUserUids$ = this.userService.getAuthorizedUids().pipe(
    tap((uids) => {
      this._userUids.set(uids);
    }),
    // cache the result as long as at least one subscriber exists (angular router does not seem to unsubscribe on navigation so it will keep state until page reload)
    shareReplay({ bufferSize: 1, refCount: false }),
  );

  login() {
    this.oidcService.authorize();
  }

  logout() {
    this.oidcService
      .logoff()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.router.navigate(['/']).then();
      });
  }

  getUserFullName() {
    if (!this.userInfo()) {
      return '';
    }
    return [this.userInfo()?.givenName, this.userInfo()?.familyName].filter(Boolean).join(' ');
  }

  getUserEmail() {
    if (!this.userInfo()) {
      return '';
    }
    return this.userInfo()?.email ?? '';
  }

  initializeAuth() {
    return this.oidcService.checkAuth().pipe(
      map(({ accessToken, isAuthenticated }) => {
        if (isAuthenticated && this.isAuthenticated()) {
          return true;
        }
        let userRoles: string[] = [];
        this._isAuthenticated.set(isAuthenticated);

        if (!isAuthenticated) {
          return false;
        }
        if (accessToken) {
          const decoded = this.decodeAccessToken(accessToken);
          // Keycloak realm roles
          if (decoded?.realm_access?.roles) {
            userRoles = userRoles.concat(decoded.realm_access.roles);
          }
        }
        this._userRoles.set(userRoles);
        return true;
      }),
    );
  }

  /**
   * Initializes and retrieves user information
   * Ensures that user is authenticated and caches user information preventing unnecessary API call.
   * Intended to be used by guards (that run in parallel), preventing multiple API calls.
   *
   * @returns An observable emitting user infos.
   */
  initializeUserInfo() {
    return this.initializeAuth().pipe(
      mergeMap((auth) => {
        if (!auth) {
          return of(undefined);
        }
        return this.userInfo$;
      }),
    );
  }

  /**
   * Initializes and retrieves the authorized UIDs for the authenticated user.
   * Ensures that user is authenticated and user info is loaded. Caches uid information preventing unnecessary API call.
   * Intended to be used by guards (that run in parallel), preventing multiple API calls.
   *
   * @returns An observable emitting an array of authorized UIDs.
   */
  initializeAuthorizedUids() {
    return this.initializeUserInfo().pipe(
      mergeMap(() => {
        if (this.shouldSkipAuthorizedUids()) {
          return throwError(
            () => new Error('user does not have correct role to fetch authorized uids'),
          );
        }
        const cachedUids = this.userUids();
        if (cachedUids.length > 0) {
          return of(cachedUids);
        }
        return this.authorizedUserUids$;
      }),
    );
  }

  private shouldSkipAuthorizedUids(): boolean {
    if (!this.isAuthenticated()) {
      return true;
    }

    const isImpersonating = sessionStorage.getItem(KTIDP_IMPERSONATION_QUERY_PARAM);
    const isProducer = this.isProducer();

    return !isProducer && !isImpersonating;
  }

  private decodeAccessToken(token: string) {
    try {
      const payload = token.split('.')[1];
      return JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
    } catch {
      console.error('failed to decode access token');
      return {};
    }
  }
}
