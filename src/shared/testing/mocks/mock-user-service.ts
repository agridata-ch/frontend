import { UserService } from '@/entities/api/user.service';
import { UidDto, UserInfoDto } from '@/entities/openapi';
import { Mockify } from '@/shared/testing/mocks';

export type MockUserService = Mockify<UserService>;

export const mockUserService = {
  getAuthorizedUids: vi.fn().mockReturnValue(Promise.resolve([{ uid: '123' } as UidDto])),
  getProducers: vi
    .fn()
    .mockReturnValue(Promise.resolve({ items: [], totalItems: 0, totalPages: 1, page: 0 })),
} satisfies Partial<UserService>;

export function createMockUserService(): MockUserService {
  return {
    updateUserPreferences: vi.fn().mockResolvedValue(Promise.resolve()),
    getUserInfo: vi.fn().mockReturnValue(Promise.resolve({} as UserInfoDto)),
    getAuthorizedUids: vi.fn().mockReturnValue(Promise.resolve([{ uid: '123' } as UidDto])),
    getProducers: vi
      .fn()
      .mockReturnValue(Promise.resolve({ items: [], totalItems: 0, totalPages: 1, page: 0 })),
  };
}
