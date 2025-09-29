import { UserService } from '@/entities/api/user.service';
import { UidDto } from '@/entities/openapi';

export const mockUserService: Partial<UserService> = {
  getAuthorizedUids: jest.fn().mockReturnValue(Promise.resolve([{ uid: '123' } as UidDto])),
  getProducers: jest
    .fn()
    .mockReturnValue(Promise.resolve({ items: [], totalItems: 0, totalPages: 1, page: 0 })),
};
