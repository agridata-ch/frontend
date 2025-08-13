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
