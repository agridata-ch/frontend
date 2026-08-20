import { computed, Injectable, signal } from '@angular/core';

import { ConsentRequestProducerViewV2Dto, ConsentRequestStateEnum } from '@/entities/openapi';

/**
 * Panel-scoped state for editing per-BUR consent-request decisions. Bridges the presentational
 * decisions list (which stages toggle state) and the details panel footer (which owns the actual
 * submit). Provide it on the details component, never in root.
 *
 * CommentLastReviewed: 2026-08-18
 */
@Injectable()
export class ConsentRequestDecisionStore {
  // Signals
  readonly consentRequests = signal<ConsentRequestProducerViewV2Dto[]>([]);
  readonly editMode = signal(false);
  // BUR consent-request id -> staged decision (true = grant, false = decline).
  readonly decisions = signal<Record<string, boolean>>({});

  // Computed Signals
  readonly burRequests = computed(() =>
    this.consentRequests().filter((request) => request.dataProducerBur),
  );
  // There is only ever one non-BUR (UID) consent-request per aggregation; take the first defensively
  // in case malformed data carries more than one.
  readonly uidRequest = computed(() =>
    this.consentRequests().find((request) => !request.dataProducerBur),
  );
  readonly grantedCount = computed(() => Object.values(this.decisions()).filter(Boolean).length);

  cancelEdit(): void {
    this.editMode.set(false);
    this.decisions.set({});
  }

  setDecision(id: string, checked: boolean): void {
    this.decisions.update((current) => ({ ...current, [id]: checked }));
  }

  // Seeds each BUR toggle from its current state, but an undecided (OPENED) child defaults to
  // accepted: only an explicitly DECLINED child starts off.
  startEdit(): void {
    const seeded: Record<string, boolean> = {};
    for (const request of this.burRequests()) {
      seeded[request.id] = request.stateCode !== ConsentRequestStateEnum.Declined;
    }
    this.decisions.set(seeded);
    this.editMode.set(true);
  }
}
