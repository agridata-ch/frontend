import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { ErrorHandlerService } from '@/app/error/error-handler.service';
import { AgridataStateService } from '@/entities/api/agridata-state.service';
import { CmsService } from '@/entities/cms';
import { UserInfoDto } from '@/entities/openapi';
import { AuthService } from '@/shared/lib/auth';
import { mockCmsService } from '@/shared/testing/mocks';
import {
  createMockAgridataStateService,
  MockAgridataStateService,
} from '@/shared/testing/mocks/mock-agridata-state-service';
import { createMockAuthService, MockAuthService } from '@/shared/testing/mocks/mock-auth-service';
import {
  createMockErrorHandlerService,
  MockErrorHandlerService,
} from '@/shared/testing/mocks/mock-error-handler.service';
import { HeaderWidgetComponent } from '@/widgets/header-widget';

describe('HeaderWidgetComponent', () => {
  let fixture: ComponentFixture<HeaderWidgetComponent>;
  let component: HeaderWidgetComponent;
  let authService: MockAuthService;
  let errorService: MockErrorHandlerService;
  let cmsService: Partial<CmsService>;
  let router: jest.Mocked<Router>;
  let stateService: MockAgridataStateService;
  beforeEach(async () => {
    router = {
      navigate: jest.fn().mockReturnValue(Promise.resolve()),
      createUrlTree: jest.fn(),
      serializeUrl: jest.fn(),
      events: {
        subscribe: jest.fn(),
      },
    } as unknown as jest.Mocked<Router>;
    errorService = createMockErrorHandlerService();
    cmsService = mockCmsService;
    authService = createMockAuthService();
    stateService = createMockAgridataStateService();

    await TestBed.configureTestingModule({
      imports: [HeaderWidgetComponent, RouterLink],
      providers: [
        { provide: AuthService, useValue: authService },
        { provide: ActivatedRoute, useValue: {} },
        { provide: CmsService, useValue: cmsService },
        { provide: ErrorHandlerService, useValue: errorService },
        { provide: AgridataStateService, useValue: stateService },
        { provide: Router, useValue: router },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(HeaderWidgetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should handle errors from fetchProducersResource and send them to errorService', async () => {
    const testError = new Error('Test error from getProducers');
    (cmsService.fetchCmsPages as jest.Mock).mockRejectedValueOnce(testError);

    // Create a new fixture with the mocked error
    const errorFixture = TestBed.createComponent(HeaderWidgetComponent);
    errorFixture.detectChanges();
    await errorFixture.whenStable();

    expect(errorService.handleError).toHaveBeenCalledWith(testError);
  });

  it('isAuthenticated signal reflects AuthService.isAuthenticated()', () => {
    authService.__testSignals.isAuthenticated.set(false);
    fixture.detectChanges();
    expect(component.isAuthenticated()).toBe(false);

    authService.__testSignals.isAuthenticated.set(true);
    fixture.detectChanges();

    expect(component.isAuthenticated()).toBe(true);
  });

  it('userData signal reflects AuthService.userData()', () => {
    const fakeUser: UserInfoDto = {
      givenName: 'Alice',
      email: 'alice@example.com',
      familyName: 'Smith',
      uid: '123',
    };
    authService.__testSignals.userInfo.set(fakeUser);
    fixture.detectChanges();
    expect(component.userInfo()).toBe(fakeUser);

    authService.__testSignals.userInfo.set(undefined);
    fixture.detectChanges();
    expect(component.userInfo()).toBeFalsy();
  });

  it('login() calls AuthService.login()', () => {
    const navigateSpy = jest.spyOn(authService, 'login');
    component.login();
    expect(navigateSpy).toHaveBeenCalled();
  });

  it('should return slug (cms page name)', () => {
    stateService.__testSignals.currentRoute.set('/cms/test');
    fixture.detectChanges();
    const currentPage = component.currentCmsPageSlug();
    expect(currentPage).toBe('test');
  });

  it('should return null if current page is not cms page', () => {
    stateService.__testSignals.currentRoute.set('/test');
    fixture.detectChanges();
    const currentPage = component.currentCmsPageSlug();
    expect(currentPage).toBe(null);
  });
});
