import { DestroyRef, Injectable, computed, effect, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { OidcSecurityService } from 'angular-auth-oidc-client';

import { UserInfoDto, UsersService } from '@/entities/openapi';
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
  private readonly participantService = inject(UsersService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  readonly isAuthenticated = signal<boolean>(false);
  readonly userData = signal<UserInfoDto | null>(null);
  readonly userRoles = signal<string[] | null>(null);
  readonly isProducer = computed(
    () => this.userRoles()?.includes(USER_ROLES.AGRIDATA_CONSENT_REQUESTS_PRODUCER) ?? false,
  );
  readonly isConsumer = computed(
    () => this.userRoles()?.includes(USER_ROLES.AGRIDATA_DATA_REQUESTS_CONSUMER) ?? false,
  );

  readonly isSupporter = computed(
    () => this.userRoles()?.includes(USER_ROLES.AGRIDATA_SUPPORTER) ?? false,
  );

  readonly checkAuthEffect = effect(() => {
    this.checkAuth();
  });

  private decodeJwt(token: string) {
    try {
      const payloadBase64 = token.split('.')[1];
      const normalized = payloadBase64.replace(/-/g, '+').replace(/_/g, '/');
      const json = atob(normalized);
      return JSON.parse(json);
    } catch {
      return {};
    }
  }

  checkAuth() {
    this.oidcService
      .checkAuth()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(({ isAuthenticated, accessToken }) => {
        this.isAuthenticated.set(isAuthenticated);
        if (isAuthenticated) {
          this.participantService
            .getUserInfo()
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe((userData) => {
              this.userData.set(userData);
            });
          const decoded = this.decodeJwt(accessToken);
          const roles =
            decoded?.realm_access?.roles && Array.isArray(decoded.realm_access.roles)
              ? decoded.realm_access.roles
              : [];
          this.userRoles.set(roles);
        } else {
          this.userData.set(null);
        }
      });
  }

  login() {
    this.oidcService.authorize();
  }

  logout() {
    this.oidcService
      .logoff()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.router.navigate(['/']);
      });
  }

  getUserFullName() {
    if (!this.userData()) {
      return '';
    }
    return `${this.userData()?.givenName ?? ''} ${this.userData()?.familyName ?? ''}`;
  }

  getUserEmail() {
    if (!this.userData()) {
      return '';
    }
    return this.userData()?.email ?? '';
  }
}
