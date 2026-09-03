import { signal, WritableSignal } from '@angular/core';

import { AgbModalService } from '@/features/agb-modal';
import { MockifyWithWritableSignals } from '@/shared/testing/mocks';

export type MockAgbModalServiceTestSignals = {
  open: WritableSignal<boolean>;
  enforceConsentFrom: WritableSignal<string | undefined>;
  hasAcceptedPreviousAgb: WritableSignal<boolean>;
  isSkippable: WritableSignal<boolean>;
  isAgbConsentEnforced: WritableSignal<boolean>;
};

export type MockAgbModalService = MockifyWithWritableSignals<
  AgbModalService,
  MockAgbModalServiceTestSignals
>;

/**
 * Factory that creates a fully-typed mock of `AgbModalService`.
 * The readonly signals the modal reads are writable via `__testSignals`,
 * and `accept`/`dismiss` are jest mocks.
 *
 * CommentLastReviewed: 2026-07-28
 */
export function createMockAgbModalService(): MockAgbModalService {
  const open = signal(false);
  const enforceConsentFrom = signal<string | undefined>(undefined);
  const hasAcceptedPreviousAgb = signal(false);
  const isSkippable = signal(false);
  const isAgbConsentEnforced = signal(false);

  return {
    open,
    enforceConsentFrom,
    hasAcceptedPreviousAgb,
    isSkippable,
    isAgbConsentEnforced,
    accept: vi.fn().mockResolvedValue(undefined),
    dismiss: vi.fn(),
    __testSignals: {
      open,
      enforceConsentFrom,
      hasAcceptedPreviousAgb,
      isSkippable,
      isAgbConsentEnforced,
    },
  } satisfies MockAgbModalService;
}
