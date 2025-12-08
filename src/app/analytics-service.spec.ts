import { TestBed } from '@angular/core/testing';
import { TranslocoService } from '@jsverse/transloco';
import { OidcSecurityService } from 'angular-auth-oidc-client';
import { of } from 'rxjs';

import { GA_MEASUREMENT_ID, GA_SCRIPT_URL } from '@/app/analytics.config';
import { TitleService } from '@/app/title.service';
import { AgridataStateService } from '@/entities/api/agridata-state.service';
import {
  createMockAgridataStateService,
  MockAgridataStateService,
} from '@/shared/testing/mocks/mock-agridata-state-service';
import {
  createMockTitleService,
  MockTitleService,
} from '@/shared/testing/mocks/mock-title-service';
import { createTranslocoTestingModule } from '@/shared/testing/transloco-testing.module';

import { AnalyticsService } from './analytics.service';

describe('AnalyticsServiceService', () => {
  let service: AnalyticsService;
  let oidcService: Partial<OidcSecurityService>;
  let stateService: MockAgridataStateService;
  let translocoService: TranslocoService;
  let titleService: MockTitleService;
  beforeEach(() => {
    // Clear localStorage and set cookies as accepted for tests
    localStorage.clear();
    localStorage.setItem('cookiesAccepted', 'true');

    oidcService = {
      checkAuth: jest.fn(),
      isAuthenticated$: of({
        isAuthenticated: true,
        allConfigsAuthenticated: [],
      }),
    };
    titleService = createMockTitleService();
    stateService = createMockAgridataStateService();
    TestBed.configureTestingModule({
      imports: [createTranslocoTestingModule()],
      providers: [
        { provide: OidcSecurityService, useValue: oidcService },
        { provide: AgridataStateService, useValue: stateService },
        { provide: GA_MEASUREMENT_ID, useValue: '1' },
        { provide: GA_SCRIPT_URL, useValue: 'test' },
        { provide: TitleService, useValue: titleService },
      ],
    });
    service = TestBed.inject(AnalyticsService);
    translocoService = TestBed.inject(TranslocoService);
    TestBed.tick();
  });

  afterEach(() => {
    localStorage.clear();
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

  it('should set user properties on lang change', () => {
    const window = globalThis as unknown as { gtag?: () => void };

    const gtagSpy = jest.spyOn(window, 'gtag');

    translocoService.setActiveLang('fr');
    TestBed.tick();

    expect(gtagSpy).toHaveBeenCalledWith('set', 'user_properties', { language: 'fr' });
  });

  it('should track page changes', () => {
    const window = globalThis as unknown as { gtag?: () => void };

    const gtagSpy = jest.spyOn(window, 'gtag');

    titleService.__testSignals.roTranslatedTitle.set('new page');
    titleService.__testSignals.ro18nTitle.set('new.page');
    titleService.__testSignals.roRoute.set('route');

    TestBed.tick();

    expect(gtagSpy).toHaveBeenCalledWith('event', 'page_view', {
      page_path: 'route',
      page_location: 'http://localhost/',
      page_title: 'new page',
      page_title_key: 'new.page',
    });
  });

  describe('setCookiesAccepted', () => {
    it('should set cookiesAccepted to true in localStorage when accepting', () => {
      service.setCookiesAccepted(true);

      expect(localStorage.getItem('cookiesAccepted')).toBe('true');
    });

    it('should set cookiesAccepted to false in localStorage when declining', () => {
      service.setCookiesAccepted(false);

      expect(localStorage.getItem('cookiesAccepted')).toBe('false');
    });

    it('should disable analytics when cookies are declined', () => {
      service.setCookiesAccepted(false);
      const window = globalThis as unknown as { gtag?: () => void };
      const gtagSpy = jest.spyOn(window, 'gtag');

      service.logEvent('test_event');

      expect(gtagSpy).not.toHaveBeenCalled();
    });

    it('should enable analytics when cookies are accepted', () => {
      // First decline to test re-enabling
      service.setCookiesAccepted(false);
      service.setCookiesAccepted(true);

      const window = globalThis as unknown as { gtag?: () => void };
      const gtagSpy = jest.spyOn(window, 'gtag');

      service.logEvent('test_event');

      expect(gtagSpy).toHaveBeenCalledWith('event', 'test_event', {});
    });
  });

  describe('getCookiesAccepted', () => {
    it('should return true when cookiesAccepted is true in localStorage', () => {
      localStorage.setItem('cookiesAccepted', 'true');

      expect(service.getCookiesAccepted()).toBe(true);
    });

    it('should return false when cookiesAccepted is false in localStorage', () => {
      localStorage.setItem('cookiesAccepted', 'false');

      expect(service.getCookiesAccepted()).toBe(false);
    });

    it('should return false when cookiesAccepted is not set in localStorage', () => {
      localStorage.removeItem('cookiesAccepted');

      expect(service.getCookiesAccepted()).toBe(false);
    });
  });

  describe('analytics disabled when cookies not accepted', () => {
    let serviceWithoutCookies: AnalyticsService;

    beforeEach(() => {
      localStorage.clear();
      localStorage.setItem('cookiesAccepted', 'false');

      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        imports: [createTranslocoTestingModule()],
        providers: [
          { provide: OidcSecurityService, useValue: oidcService },
          { provide: AgridataStateService, useValue: stateService },
          { provide: GA_MEASUREMENT_ID, useValue: '1' },
          { provide: GA_SCRIPT_URL, useValue: 'test' },
          { provide: TitleService, useValue: titleService },
        ],
      });
      serviceWithoutCookies = TestBed.inject(AnalyticsService);
      TestBed.tick();
    });

    it('should not inject gtag script when cookies are not accepted', () => {
      const window = globalThis as unknown as { gtag?: () => void };
      const gtagSpy = jest.spyOn(window, 'gtag');

      // Trigger some analytics actions
      titleService.__testSignals.roTranslatedTitle.set('test page');
      TestBed.tick();

      // gtag should not be called because analytics is disabled
      expect(gtagSpy).not.toHaveBeenCalled();
    });

    it('should not call gtag when logEvent is called without cookie acceptance', () => {
      const window = globalThis as unknown as { gtag?: () => void };
      const gtagSpy = jest.spyOn(window, 'gtag');

      serviceWithoutCookies.logEvent('test_event', { param1: 'value1' });

      expect(gtagSpy).not.toHaveBeenCalled();
    });

    it('should not set user properties when cookies are not accepted', () => {
      const window = globalThis as unknown as { gtag?: () => void };
      const gtagSpy = jest.spyOn(window, 'gtag');

      serviceWithoutCookies.setUserProperties({ test: 'value' });

      expect(gtagSpy).not.toHaveBeenCalled();
    });
  });
});
