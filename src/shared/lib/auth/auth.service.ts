import { DestroyRef, Injectable, computed, effect, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { OidcSecurityService } from 'angular-auth-oidc-client';
import { firstValueFrom } from 'rxjs';

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
    if (this.isAuthenticated()) {
      this.participantService
        .getUserInfo()
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe((userData) => {
          this.userData.set(userData);
        });
    } else {
      this.userRoles.set(null);
      this.userData.set(null);
    }
  });

  oidcPromise() {
    const result = firstValueFrom(this.oidcService.checkAuth());
    result.then((auth) => {
      this.isAuthenticated.set(auth.isAuthenticated);
    });
    return result;
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

  setUserRoles(roles: string[]) {
    this.userRoles.set(roles);
  }
}
