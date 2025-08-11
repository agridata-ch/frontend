/// <reference types="jest" />

export class MockAuthService {
  isAuthenticated = jest.fn().mockReturnValue(false);
  userData = jest.fn().mockReturnValue(null);
  userRoles = jest.fn().mockReturnValue(['user']);
  isProducer = jest.fn().mockReturnValue(false);
  logout = jest.fn();
  login = jest.fn();

  checkAuth = jest.fn().mockReturnValue({
    pipe: jest.fn().mockReturnValue({
      subscribe: jest.fn(),
    }),
  });

  getUserFullName = jest.fn().mockReturnValue('');
}
