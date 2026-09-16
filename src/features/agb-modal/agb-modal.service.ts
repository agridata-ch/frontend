import { computed, effect, inject, resource, Service, signal } from '@angular/core';

import { AgbService } from '@/entities/api';
import { AgridataStateService } from '@/entities/api/agridata-state.service';
import { AgbRevisionDto } from '@/entities/openapi';
import { AuthService } from '@/shared/lib/auth';

/**
 * Owns the show/accept state for the sign-in AGB modal so the modal component stays presentational.
 * Visibility and mandatoriness are decided exclusively from the user's `enforceAgbAcceptanceFrom`
 * deadline: absent means no acceptance pending, a future date means optional/dismissible, and a date
 * in the past or present means consent is enforced (blocking the whole app). Also records acceptance.
 *
 * CommentLastReviewed: 2026-09-16
 */
@Service()
export class AgbModalService {
  // Injects
  private readonly agbService = inject(AgbService);
  private readonly agridataStateService = inject(AgridataStateService);
  private readonly authService = inject(AuthService);

  // Signals
  private readonly _open = signal(false);

  readonly open = this._open.asReadonly();

  // Computed signals
  private readonly agbResource = resource({
    loader: () => this.agbService.fetchAgbs(),
  });
  private readonly agb = computed<AgbRevisionDto | undefined>(() => this.agbResource.value());

  readonly enforceConsentFrom = computed(
    () => this.authService.userInfo()?.enforceAgbAcceptanceFrom,
  );

  readonly hasAcceptedPreviousAgb = computed(
    () => !!this.authService.userInfo()?.lastAcceptedAgbDate,
  );

  private readonly shouldShow = computed(
    () =>
      (this.authService.isConsumer() || this.authService.isDataProvider()) &&
      !!this.enforceConsentFrom(),
  );

  readonly isAgbConsentEnforced = computed(() => {
    const raw = this.enforceConsentFrom();
    return !!raw && new Date(raw).getTime() <= Date.now();
  });

  readonly isSkippable = computed(() => this.shouldShow() && !this.isAgbConsentEnforced());

  // Effects
  private readonly syncOpenEffect = effect(() => {
    const loggedIn = this.authService.justLoggedIn();
    const isAgbConsentEnforced = this.isAgbConsentEnforced();

    if (loggedIn || isAgbConsentEnforced) {
      this._open.set(this.shouldShow());
    }
  });

  private readonly syncAgbConsentEnforcedEffect = effect(() => {
    this.agridataStateService.setAgbConsentEnforced(this.isAgbConsentEnforced());
  });

  async accept(): Promise<void> {
    const id = this.agb()?.id;
    if (!id) {
      throw new Error('Cannot accept AGB: current revision id is unknown.');
    }
    await this.agbService.acceptAgbs(id);
    await this.authService.refreshUserInfo();
    this._open.set(false);
  }

  dismiss(): void {
    this._open.set(false);
  }
}
