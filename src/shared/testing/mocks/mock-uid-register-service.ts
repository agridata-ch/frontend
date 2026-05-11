import { UidRegisterService } from '@/entities/api';
import { Mockify } from '@/shared/testing/mocks';

export type MockUidRegisterService = Mockify<UidRegisterService>;

export function createMockUidRegisterService(): MockUidRegisterService {
  return {
    fetchUidInfosOfCurrentUser: jest.fn().mockResolvedValue([]),
  };
}
