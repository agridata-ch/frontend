import { ErrorHandlerService } from '@/shared/error/error-handler.service';
import { Mockify } from '@/shared/testing/mocks';

export type MockErrorHandlerService = Mockify<ErrorHandlerService>;

/**
 * Factory that creates a strict mock implementation of ErrorHandlerService for tests.
 * All methods are vi.fn mocks mirroring the shallow partial mock above.
 *
 * CommentLastReviewed: 2025-11-04
 */
export function createMockErrorHandlerService(): MockErrorHandlerService {
  return {
    handleError: vi.fn(),
    getGlobalErrors: vi.fn(),
    markAllGlobalAsHandled: vi.fn(),
    getAllErrors: vi.fn(),
    registerHandler: vi.fn().mockReturnValue('1'),
    getErrorsForHandler: vi.fn(),
    markAllErrorsOfHandlerAsHandled: vi.fn(),
    unregisterHandler: vi.fn(),
    markAllAsHandled: vi.fn(),
    getHandlerIds: vi.fn().mockReturnValue([]),
    ngOnDestroy: vi.fn(),
  } satisfies MockErrorHandlerService;
}
