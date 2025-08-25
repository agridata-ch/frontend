import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { OidcSecurityService } from 'angular-auth-oidc-client';
import { Subject, takeUntil } from 'rxjs';

import { USER_ROLES } from '@/shared/constants/constants';

export type UserData = {
  email: string;
  family_name: string;
  given_name: string;
  loginid: string;
  name: string;
  preferred_username: string;
  sub: string;
  uid: number | string;
};

/**
 * Manages authentication state, user profile data, and role extraction from tokens. Provides login,
 * logout, and authentication status monitoring with reactive signals.
 *
 * CommentLastReviewed: 2025-08-25
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly oidcService = inject(OidcSecurityService);
  private readonly router = inject(Router);
  private readonly destroy$ = new Subject<void>();

  readonly isAuthenticated = signal<boolean>(false);
  readonly userData = signal<UserData | null>(null);
  readonly userRoles = signal<string[] | null>(null);
  readonly isProducer = computed(
    () => this.userRoles()?.includes(USER_ROLES.AGRIDATA_CONSENT_REQUESTS_PRODUCER) ?? false,
  );

  constructor() {
    this.checkAuth(true);

    // Listen for “storage” events so other tabs’ logins/logouts propagate here
    window.addEventListener('storage', (event: StorageEvent) => {
      if (event.key?.startsWith('oidc.')) {
        this.checkAuth();
      }
    });
  }

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

  checkAuth(updateLocalStorage = false) {
    this.oidcService
      .checkAuth()
      .pipe(takeUntil(this.destroy$))
      .subscribe(({ isAuthenticated, userData, accessToken }) => {
        this.isAuthenticated.set(isAuthenticated);
        if (isAuthenticated) {
          this.userData.set({
            ...userData,
            uid:
              typeof userData.uid === 'string'
                ? Number(userData.uid?.replace('CHE', ''))
                : userData.uid,
          });
          const decoded = this.decodeJwt(accessToken);
          const roles =
            decoded?.realm_access?.roles && Array.isArray(decoded.realm_access.roles)
              ? decoded.realm_access.roles
              : [];
          this.userRoles.set(roles);
          if (updateLocalStorage) {
            localStorage.setItem('oidc.user', JSON.stringify(userData));
          }
        } else {
          this.userData.set(null);
          if (updateLocalStorage) {
            localStorage.removeItem('oidc.user');
          }
        }
      });
  }

  login() {
    this.oidcService.authorize();
  }

  logout() {
    this.oidcService
      .logoff()
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.router.navigate(['/']);
      });
  }

  getUserFullName() {
    if (!this.userData()) {
      return '';
    }
    return `${this.userData()?.given_name ?? ''} ${this.userData()?.family_name ?? ''}`;
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
