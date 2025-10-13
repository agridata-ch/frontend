/**
 * Mimics the UID register service for testing identifier validation and lookups.
 *
 * CommentLastReviewed: 2025-08-25
 */
export class MockUidRegisterService {
  fetchUidInfosOfCurrentUser = {
    value: () => ({
      uid: 123,
      legalName: 'Test User',
      address: {
        city: 'Test City',
        zip: '12345',
        street: 'Test Street',
        country: 'Test Country',
      },
    }),
    isLoading: () => false,
    reload: () => {},
    error: () => null,
  };

  searchByUidResource = (uid: number) => ({
    value: () => ({
      uid,
      legalName: 'Other User',
      address: {
        city: 'Other City',
        zip: '54321',
        street: 'Other Street',
        country: 'Other Country',
      },
    }),
    isLoading: () => false,
    reload: () => {},
    error: () => null,
  });
}

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
