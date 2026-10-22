import { BurRegisterService } from '@/entities/api';
import { Mockify } from '@/shared/testing/mocks';

export type MockBurRegisterService = Mockify<BurRegisterService>;

export function createMockBurRegisterService(): MockBurRegisterService {
  return {
    fetchBurInfosOfCurrentUser: vi.fn().mockResolvedValue({}),
  };
}
