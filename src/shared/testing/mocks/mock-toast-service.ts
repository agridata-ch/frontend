import { signal } from '@angular/core';

import { Mockify } from '@/shared/testing/mocks/test-model';
import { Toast, ToastService } from '@/shared/toast';

export type MockToastService = Mockify<ToastService>;

/**
 * Factory that creates a strict mock implementation of ToastService for tests.
 *
 * CommentLastReviewed: 2026-03-09
 */
export function createMockToastService(): MockToastService {
  return {
    toasts: signal<Toast[]>([]),
    clear: jest.fn(),
    dismiss: jest.fn(),
    show: jest.fn().mockReturnValue(1),
  } satisfies MockToastService;
}
