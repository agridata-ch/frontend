import { AnalyticsService } from '@/app/analytics.service';
import { Mockify } from '@/shared/testing/mocks';

export type MockAnalyticsService = Mockify<AnalyticsService>;

export function createMockAnalyticsService(): MockAnalyticsService {
  return {
    getCookiesAccepted: jest.fn().mockReturnValue(false),
    logEvent: jest.fn(),
    logPageHit: jest.fn(),
    setCookiesAccepted: jest.fn(),
    setUserProperties: jest.fn(),
  } satisfies MockAnalyticsService;
}
