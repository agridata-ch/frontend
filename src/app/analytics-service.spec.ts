import { TestBed } from '@angular/core/testing';
import { OidcSecurityService } from 'angular-auth-oidc-client';
import { of } from 'rxjs';

import { GA_MEASUREMENT_ID, GA_SCRIPT_URL } from '@/app/analytics.config';
import { AgridataStateService } from '@/entities/api/agridata-state.service';
import {
  createMockAgridataStateService,
  MockAgridataStateService,
} from '@/shared/testing/mocks/mock-agridata-state-service';

import { AnalyticsService } from './analytics.service';

describe('AnalyticsServiceService', () => {
  let service: AnalyticsService;
  let oidcService: Partial<OidcSecurityService>;
  let stateService: MockAgridataStateService;

  beforeEach(() => {
    oidcService = {
      checkAuth: jest.fn(),
      isAuthenticated$: of({
        isAuthenticated: true,
        allConfigsAuthenticated: [],
      }),
    };
    stateService = createMockAgridataStateService();
    TestBed.configureTestingModule({
      providers: [
        { provide: OidcSecurityService, useValue: oidcService },
        { provide: AgridataStateService, useValue: stateService },
        { provide: GA_MEASUREMENT_ID, useValue: '1' },
        { provide: GA_SCRIPT_URL, useValue: 'test' },
      ],
    });
    service = TestBed.inject(AnalyticsService);
    TestBed.tick();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('gtag should be available in global window', () => {
    const window = globalThis as unknown as { gtag?: () => void };
    expect(window.gtag).toBeTruthy();
    expect(typeof window.gtag).toBe('function');
  });

  it('should inject gtag script into document head', () => {
    const scripts = Array.from(document.head.getElementsByTagName('script'));
    const gtagScript = scripts.find((script) => script.src.includes('http://localhost/test?id=1'));

    expect(gtagScript).toBeTruthy();
    expect(gtagScript?.async).toBe(true);
  });

  it('should call gtag when logEvent is called', () => {
    const window = globalThis as unknown as { gtag?: () => void };

    const gtagSpy = jest.spyOn(window, 'gtag');
    service.logEvent('test_event', { param1: 'value1' });

    expect(gtagSpy).toHaveBeenCalledWith('event', 'test_event', { param1: 'value1' });
  });
});
