import { computed, effect, inject, resource, Service, signal } from '@angular/core';

import { AgbService } from '@/entities/api';
import { AgridataStateService } from '@/entities/api/agridata-state.service';
import { AgbRevisionDto } from '@/entities/openapi';
import { AuthService } from '@/shared/lib/auth';

/**
 * Owns the show/accept state for the sign-in AGB modal so the modal component stays presentational.
 * Decides when the modal should appear (role- and version-gated), whether it may be skipped, and
 * whether consent is enforced (blocking the whole app), and records acceptance.
 *
 * CommentLastReviewed: 2026-07-28
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

  readonly enforceConsentFrom = computed(() => this.agb()?.enforceConsentFrom);

  private readonly accepted = computed(() => {
    const userInfo = this.authService.userInfo();
    const revision = this.agb();
    if (!revision?.id || !revision.validFrom) {
      return false;
    }
    if (userInfo?.lastAcceptedAgbRevisionId !== revision.id) {
      return false;
    }
    const acceptedDate = userInfo?.lastAcceptedAgbDate;
    if (!acceptedDate) {
      return false;
    }
    return new Date(acceptedDate) >= new Date(revision.validFrom);
  });

  private readonly shouldShow = computed(() => {
    if (!this.authService.isAuthenticated()) {
      return false;
    }
    if (!this.authService.isConsumer() && !this.authService.isDataProvider()) {
      return false;
    }
    if (!this.agb()?.id) {
      return false;
    }
    if (this.accepted()) {
      return false;
    }

    return true;
  });

  private readonly enforcePassed = computed(() => {
    const raw = this.enforceConsentFrom();
    return !!raw && new Date(raw).getTime() <= Date.now();
  });

  readonly hasAcceptedPreviousAgb = computed(
    () => !!this.authService.userInfo()?.lastAcceptedAgbDate,
  );

  // Skippable only when a returning user has a newer revision to accept and the enforce deadline has
  // not passed yet. First-time users and passed deadlines are non-skippable.
  readonly isSkippable = computed(
    () => this.shouldShow() && this.hasAcceptedPreviousAgb() && !this.enforcePassed(),
  );

  private readonly isEnforcementEligible = computed(
    () =>
      this.authService.isAuthenticated() &&
      (this.authService.isConsumer() || this.authService.isDataProvider()),
  );

  private readonly isConsentStatusResolving = computed(
    () => this.isEnforcementEligible() && this.agbResource.isLoading(),
  );

  // Consent is enforced: the modal is shown and cannot be skipped, so the whole app must be blocked.
  readonly isAgbConsentEnforced = computed(
    () => this.isConsentStatusResolving() || (this.shouldShow() && !this.isSkippable()),
  );

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
