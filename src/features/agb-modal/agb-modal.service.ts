import { computed, effect, inject, resource, Service, signal } from '@angular/core';

import { AgbService } from '@/entities/api';
import { AgbRevisionDto } from '@/entities/openapi';
import { formatDate } from '@/shared/date';
import { AuthService } from '@/shared/lib/auth';

/**
 * Owns the show/accept state for the sign-in AGB modal so the modal component stays presentational.
 * Decides when the modal should appear (role- and version-gated) and records acceptance.
 *
 * CommentLastReviewed: 2026-07-20
 */
@Service()
export class AgbModalService {
  // Injects
  private readonly agbService = inject(AgbService);
  private readonly authService = inject(AuthService);

  // Constants
  private readonly AGB_MODAL_ENABLED = true;

  // Signals
  private readonly _open = signal(false);

  readonly open = this._open.asReadonly();

  // Computed signals
  private readonly agbResource = resource({
    loader: () => this.agbService.fetchAgbs(),
  });
  private readonly agb = computed<AgbRevisionDto | undefined>(() => this.agbResource.value());

  readonly enforceConsentFrom = computed(() => formatDate(this.agb()?.enforceConsentFrom));

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
    if (!this.AGB_MODAL_ENABLED || !this.authService.isAuthenticated()) {
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
    // The modal only surfaces right after a fresh login, never on a plain refresh or silent token
    // renew.
    return this.authService.justLoggedIn();
  });

  // Effects
  private readonly syncOpenEffect = effect(() => {
    this._open.set(this.shouldShow());
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
