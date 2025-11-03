import { UidRegisterService } from '@/entities/api';
import { Mockify } from '@/shared/testing/mocks/test-model';

export type MockUidRegisterService = Mockify<UidRegisterService>;

export function createMockUidRegisterService(): MockUidRegisterService {
  return {
    fetchUidInfosOfCurrentUser: jest.fn().mockResolvedValue([]),
  };
}
