import { DestroyRef, Injectable, computed, effect, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { OidcSecurityService } from 'angular-auth-oidc-client';
import { of, switchMap, tap } from 'rxjs';

import { UserService } from '@/entities/api/user.service';
import { UserInfoDto } from '@/entities/openapi';
import { USER_ROLES } from '@/shared/constants/constants';

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

  readonly isAuthenticated = this._isAuthenticated.asReadonly();
  readonly userInfo = this._userInfo.asReadonly();
  readonly userRoles = this._userRoles.asReadonly();

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
    return `${this.userInfo()?.givenName ?? ''} ${this.userInfo()?.familyName ?? ''}`;
  }

  getUserEmail() {
    if (!this.userInfo()) {
      return '';
    }
    return this.userInfo()?.email ?? '';
  }

  initializeAuth() {
    return this.oidcService.checkAuth().pipe(
      switchMap(({ accessToken, isAuthenticated }) => {
        let userRoles: string[] = [];

        if (accessToken) {
          const decoded = this.decodeAccessToken(accessToken);
          // Keycloak realm roles
          if (decoded?.realm_access?.roles) {
            userRoles = userRoles.concat(decoded.realm_access.roles);
          }
        }
        this._userRoles.set(userRoles);

        this._isAuthenticated.set(isAuthenticated);

        if (!isAuthenticated) {
          return of(undefined);
        }
        return this.userService.getUserInfo().pipe(tap((userInfo) => this._userInfo.set(userInfo)));
      }),
    );
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
