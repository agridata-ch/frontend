import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter, Router, RouterLink } from '@angular/router';

import { ErrorHandlerService } from '@/app/error/error-handler.service';
import { CmsService } from '@/entities/cms';
import { UserInfoDto } from '@/entities/openapi';
import { ROUTE_PATHS } from '@/shared/constants/constants';
import { AuthService } from '@/shared/lib/auth';
import { MockAuthService, mockCmsService } from '@/shared/testing/mocks';
import { mockErrorHandlerService } from '@/shared/testing/mocks/mock-error-handler-service';
import { HeaderWidgetComponent } from '@/widgets/header-widget';

@Component({
  selector: 'app-dummy',
  template: '<p>Dummy</p>',
})
class DummyComponent {}

describe('HeaderWidgetComponent', () => {
  let fixture: ComponentFixture<HeaderWidgetComponent>;
  let component: HeaderWidgetComponent;
  let authService: AuthService;
  let errorService: Partial<ErrorHandlerService>;
  let cmsService: Partial<CmsService>;
  let router: Router;

  beforeEach(async () => {
    errorService = mockErrorHandlerService;
    cmsService = mockCmsService;
    await TestBed.configureTestingModule({
      imports: [HeaderWidgetComponent, RouterLink],
      providers: [
        provideRouter([{ path: ROUTE_PATHS.LOGIN, component: DummyComponent }]),
        { provide: AuthService, useClass: MockAuthService },
        { provide: ActivatedRoute, useValue: {} },
        { provide: CmsService, useValue: cmsService },
        { provide: ErrorHandlerService, useValue: errorService },
      ],
    }).compileComponents();
    authService = TestBed.inject(AuthService);
    router = TestBed.inject(Router);
    jest.clearAllMocks();
  });

  function createComponent(): void {
    fixture = TestBed.createComponent(HeaderWidgetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  it('should create', () => {
    createComponent();
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
    jest.spyOn(authService, 'isAuthenticated').mockReturnValue(false);
    createComponent();
    expect(component.isAuthenticated()).toBe(false);

    jest.spyOn(authService, 'isAuthenticated').mockReturnValue(true);
    createComponent();
    expect(component.isAuthenticated()).toBe(true);
  });

  it('userData signal reflects AuthService.userData()', () => {
    const fakeUser: UserInfoDto = {
      givenName: 'Alice',
      email: 'alice@example.com',
      familyName: 'Smith',
      uid: '123',
    };
    jest.spyOn(authService, 'userData').mockReturnValue(fakeUser);
    createComponent();
    expect(component.userData()).toBe(fakeUser);

    jest.spyOn(authService, 'userData').mockReturnValue(null);
    createComponent();
    expect(component.userData()).toBeNull();
  });

  it('login() calls AuthService.login()', () => {
    const navigateSpy = jest.spyOn(router, 'navigate');

    createComponent();
    component.login();
    expect(navigateSpy).toHaveBeenCalledWith([ROUTE_PATHS.LOGIN]);
  });
});
