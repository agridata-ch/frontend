import { AnalyticsService } from '@/shared/lib/analytics.service';
import { Mockify } from '@/shared/testing/mocks';

export type MockAnalyticsService = Mockify<AnalyticsService>;

export function createMockAnalyticsService(): MockAnalyticsService {
  return {
    getCookiesAccepted: vi.fn().mockReturnValue(false),
    logEvent: vi.fn(),
    logPageHit: vi.fn(),
    setCookiesAccepted: vi.fn(),
    setUserProperties: vi.fn(),
  } satisfies MockAnalyticsService;
}
