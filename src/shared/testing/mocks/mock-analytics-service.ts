import { AnalyticsService } from '@/app/analytics.service';
import { Mockify } from '@/shared/testing/mocks/test-model';

export type MockAnalyticsService = Mockify<AnalyticsService>;

export function createMockAnalyticsService(): MockAnalyticsService {
  return {
    logEvent: jest.fn(),
    setUserProperties: jest.fn(),
  } satisfies MockAnalyticsService;
}
