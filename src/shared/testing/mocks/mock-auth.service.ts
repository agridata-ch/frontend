/// <reference types="jest" />

import { UserInfoDto } from '@/entities/openapi';

/**
 * Provides a fake authentication service for testing login state, roles, and user data.
 *
 * CommentLastReviewed: 2025-08-27
 */
export class MockAuthService {
  isAuthenticated = jest.fn().mockReturnValue(false);
  userData = jest.fn().mockReturnValue(null);
  userRoles = jest.fn().mockReturnValue(['user']);
  isProducer = jest.fn().mockReturnValue(false);
  isConsumer = jest.fn().mockReturnValue(false);
  logout = jest.fn();
  login = jest.fn();

  checkAuth = jest.fn().mockReturnValue({
    pipe: jest.fn().mockReturnValue({
      subscribe: jest.fn(),
    }),
  });

  getUserFullName = jest.fn().mockReturnValue('');
  getUserEmail = jest.fn().mockReturnValue('');
}

export const mockUserData: UserInfoDto = {
  addressCountry: 'CH',
  addressLocality: 'Basel',
  addressPostalCode: '4051',
  addressStreet: 'Testgasse 5',
  email: 'producer-081@agridata.ch',
  familyName: '081',
  givenName: 'Producer',
  ktIdP: '***081',
  lastLoginDate: '2025-08-29T09:55:33.589684',
  phoneNumber: '+4179123456789',
};
