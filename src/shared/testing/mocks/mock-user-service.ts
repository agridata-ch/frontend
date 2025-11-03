import { UserService } from '@/entities/api/user.service';
import { UidDto } from '@/entities/openapi';
import { Mockify } from '@/shared/testing/mocks/test-model';

export type MockUserService = Mockify<UserService>;

export const mockUserService = {
  getAuthorizedUids: jest.fn().mockReturnValue(Promise.resolve([{ uid: '123' } as UidDto])),
  getProducers: jest
    .fn()
    .mockReturnValue(Promise.resolve({ items: [], totalItems: 0, totalPages: 1, page: 0 })),
} satisfies Partial<UserService>;

export function createMockUserService(): MockUserService {
  return {
    getAuthorizedUids: jest.fn().mockReturnValue(Promise.resolve([{ uid: '123' } as UidDto])),
    getProducers: jest
      .fn()
      .mockReturnValue(Promise.resolve({ items: [], totalItems: 0, totalPages: 1, page: 0 })),
  };
}
