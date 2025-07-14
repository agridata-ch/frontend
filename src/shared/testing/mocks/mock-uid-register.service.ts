export class MockUidRegisterService {
  uidInfosOfCurrentUser = {
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
  });
}
