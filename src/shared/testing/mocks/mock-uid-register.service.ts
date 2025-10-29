import { UidRegisterService } from '@/entities/api';

export const mockUidRegisterService: Partial<UidRegisterService> = {
  fetchUidInfosOfCurrentUser: jest.fn().mockResolvedValue([]),
};

/**
 * Mimics an error of the UID register service.
 *
 * CommentLastReviewed: 2025-08-25
 */
export class MockUidRegisterServiceWithError {
  fetchUidInfosOfCurrentUser = {
    value: () => ({
      message: 'An error occurred',
      requestId: '1234',
      type: 'GENERIC',
      debugMessage: 'some error debug message',
    }),
    isLoading: () => false,
    reload: () => {},
    error: () => true,
  };
}
