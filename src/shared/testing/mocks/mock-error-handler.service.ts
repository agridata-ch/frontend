import { ErrorHandlerService } from '@/app/error/error-handler.service';
import { Mockify } from '@/shared/testing/mocks/test-model';

export type MockErrorHandlerService = Mockify<ErrorHandlerService>;

/**
 * Factory that creates a strict mock implementation of ErrorHandlerService for tests.
 * All methods are jest.fn mocks mirroring the shallow partial mock above.
 *
 * CommentLastReviewed: 2025-11-04
 */
export function createMockErrorHandlerService(): MockErrorHandlerService {
  return {
    handleError: jest.fn(),
    getGlobalErrors: jest.fn(),
    markAllGlobalAsHandled: jest.fn(),
    getAllErrors: jest.fn(),
    registerHandler: jest.fn().mockReturnValue('1'),
    getErrorsForHandler: jest.fn(),
    markAllErrorsOfHandlerAsHandled: jest.fn(),
    unregisterHandler: jest.fn(),
    markAllAsHandled: jest.fn(),
    getHandlerIds: jest.fn().mockReturnValue([]),
    ngOnDestroy: jest.fn(),
  } satisfies MockErrorHandlerService;
}
