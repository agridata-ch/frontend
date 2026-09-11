import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { AgridataStateService } from '@/entities/api/agridata-state.service';
import { AnalyticsService } from '@/shared/lib/analytics.service';
import {
  createMockAgridataStateService,
  MockAgridataStateService,
  createMockAnalyticsService,
  MockAnalyticsService,
} from '@/shared/testing/mocks';
import { createTranslocoTestingModule } from '@/shared/testing/transloco-testing.module';

import { CookiebannerComponent } from './cookiebanner.component';

/**
 * Unit tests for CookiebannerComponent
 *
 * CommentLastReviewed: 2025-12-08
 */
describe('CookiebannerComponent', () => {
  let component: CookiebannerComponent;
  let fixture: ComponentFixture<CookiebannerComponent>;
  let agridataStateService: MockAgridataStateService;
  let analyticsService: MockAnalyticsService;

  beforeEach(async () => {
    agridataStateService = createMockAgridataStateService();
    analyticsService = createMockAnalyticsService();

    await TestBed.configureTestingModule({
      imports: [CookiebannerComponent, createTranslocoTestingModule()],
      providers: [
        { provide: AgridataStateService, useValue: agridataStateService },
        { provide: AnalyticsService, useValue: analyticsService },
        provideRouter([]),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CookiebannerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('acceptCookies', () => {
    it('should call analyticsService.setCookiesAccepted with true', () => {
      analyticsService.setCookiesAccepted = vi.fn();

      component['acceptCookies']();

      expect(analyticsService.setCookiesAccepted).toHaveBeenCalledWith(true);
    });

    it('should call closeCookieBanner', () => {
      const closeSpy = vi.spyOn(component as any, 'closeCookieBanner');

      component['acceptCookies']();

      expect(closeSpy).toHaveBeenCalled();
    });
  });

  describe('declineCookies', () => {
    it('should call analyticsService.setCookiesAccepted with false', () => {
      analyticsService.setCookiesAccepted = vi.fn();

      component['declineCookies']();

      expect(analyticsService.setCookiesAccepted).toHaveBeenCalledWith(false);
    });

    it('should call closeCookieBanner', () => {
      const closeSpy = vi.spyOn(component as any, 'closeCookieBanner');

      component['declineCookies']();

      expect(closeSpy).toHaveBeenCalled();
    });
  });

  describe('closeCookieBanner', () => {
    it('should call agridataStateService.hideCookieBanner', () => {
      component['closeCookieBanner']();

      expect(agridataStateService.hideCookieBanner).toHaveBeenCalled();
    });
  });
});
