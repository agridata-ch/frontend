import { Injectable, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { OidcSecurityService } from 'angular-auth-oidc-client';

export type UserData = {
  sub: string;
  name: string;
  preferred_username: string;
  email: string;
};

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly oidcService = inject(OidcSecurityService);
  private readonly router = inject(Router);

  readonly isAuthenticated = signal<boolean>(false);
  readonly userData = signal<UserData | null>(null);
  readonly userRoles = signal<string[] | null>(null);

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
    this.oidcService.checkAuth().subscribe(({ isAuthenticated, userData, accessToken }) => {
      this.isAuthenticated.set(isAuthenticated);
      if (isAuthenticated) {
        this.userData.set(userData);
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
    this.oidcService.logoff().subscribe(() => {
      this.router.navigate(['/']);
    });
  }
}
