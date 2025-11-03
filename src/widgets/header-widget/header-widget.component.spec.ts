import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter, Router, RouterLink } from '@angular/router';

import { ErrorHandlerService } from '@/app/error/error-handler.service';
import { CmsService } from '@/entities/cms';
import { UserInfoDto } from '@/entities/openapi';
import { ROUTE_PATHS } from '@/shared/constants/constants';
import { AuthService } from '@/shared/lib/auth';
import { mockCmsService } from '@/shared/testing/mocks';
import { createMockAuthService, MockAuthService } from '@/shared/testing/mocks/mock-auth-service';
import {
  createMockErrorHandlerService,
  MockErrorHandlerService,
} from '@/shared/testing/mocks/mock-error-handler.service';
import { HeaderWidgetComponent } from '@/widgets/header-widget';

@Component({
  selector: 'app-dummy',
  template: '<p>Dummy</p>',
})
class DummyComponent {}

describe('HeaderWidgetComponent', () => {
  let fixture: ComponentFixture<HeaderWidgetComponent>;
  let component: HeaderWidgetComponent;
  let authService: MockAuthService;
  let errorService: MockErrorHandlerService;
  let cmsService: Partial<CmsService>;
  let router: Router;

  beforeEach(async () => {
    errorService = createMockErrorHandlerService();
    cmsService = mockCmsService;
    // create factory mock and provide it so tests can set signals
    authService = createMockAuthService();
    await TestBed.configureTestingModule({
      imports: [HeaderWidgetComponent, RouterLink],
      providers: [
        provideRouter([{ path: ROUTE_PATHS.LOGIN, component: DummyComponent }]),
        { provide: AuthService, useValue: authService },
        { provide: ActivatedRoute, useValue: {} },
        { provide: CmsService, useValue: cmsService },
        { provide: ErrorHandlerService, useValue: errorService },
      ],
    }).compileComponents();
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
    authService.isAuthenticated.set(false);
    createComponent();
    expect(component.isAuthenticated()).toBe(false);

    authService.isAuthenticated.set(true);
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
    authService.userData.set(fakeUser);
    createComponent();
    expect(component.userData()).toBe(fakeUser);

    authService.userData.set(null);
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
