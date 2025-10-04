import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';

import { AuthService } from '@/shared/lib/auth';
import { MockAuthService } from '@/shared/testing/mocks';

import { AppComponent } from './app.component';

describe('AppComponent', () => {
  let mockAuthService: MockAuthService;
  let mockRouter: any;

  beforeEach(async () => {
    mockAuthService = new MockAuthService();
    mockRouter = {
      url: jest.fn().mockReturnValue('/'),
      navigate: jest.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: AuthService, useValue: mockAuthService },
        { provide: Router, useValue: mockRouter },
      ],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  describe('window focus behavior', () => {
    let component: AppComponent;
    let fixture: any;

    beforeEach(() => {
      fixture = TestBed.createComponent(AppComponent);
      component = fixture.componentInstance;
    });

    it('should check auth status when window gains focus', () => {
      const checkAuthSpy = jest.spyOn(mockAuthService, 'checkAuth');

      component.onWindowFocus();

      expect(checkAuthSpy).toHaveBeenCalled();
    });

    it('should not attempt to reload page if user is not authenticated', () => {
      mockAuthService.isAuthenticated.mockReturnValue(false);

      const componentSpy = jest.spyOn(component as any, 'onWindowFocus');

      component.onWindowFocus();

      expect(componentSpy).toHaveBeenCalled();
      expect(mockAuthService.isAuthenticated).toHaveBeenCalled();
    });

    it('should attempt to reload page if user is authenticated', () => {
      mockAuthService.isAuthenticated.mockReturnValue(true);
      mockRouter.url = '/';

      const componentSpy = jest.spyOn(component as any, 'onWindowFocus');

      component.onWindowFocus();

      expect(componentSpy).toHaveBeenCalled();
      expect(mockAuthService.isAuthenticated).toHaveBeenCalled();
    });

    it('should attempt to reload page if user is authenticated and on root route', () => {
      mockAuthService.isAuthenticated.mockReturnValue(true);
      mockRouter.url = '/';

      const componentInstance = component as any;
      const originalComponent = componentInstance.onWindowFocus;

      let reloadWasCalled = false;

      componentInstance.onWindowFocus = function () {
        this.authService.checkAuth();

        if (this.authService.isAuthenticated()) {
          if (this.router.url === '/') {
            reloadWasCalled = true;
          }
        }
      };

      component.onWindowFocus();

      expect(mockAuthService.isAuthenticated).toHaveReturnedWith(true);
      expect(mockRouter.url).toBe('/');
      expect(reloadWasCalled).toBe(true);

      componentInstance.onWindowFocus = originalComponent;
    });

    it('should not attempt to reload page if user is authenticated but not on root route', () => {
      mockAuthService.isAuthenticated.mockReturnValue(true);
      mockRouter.url = '/dashboard';

      const componentInstance = component as any;
      const originalComponent = componentInstance.onWindowFocus;

      let reloadWasCalled = false;

      componentInstance.onWindowFocus = function () {
        this.authService.checkAuth();

        if (this.authService.isAuthenticated()) {
          if (this.router.url === '/') {
            reloadWasCalled = true;
          }
        }
      };

      component.onWindowFocus();

      expect(mockAuthService.isAuthenticated).toHaveReturnedWith(true);
      expect(mockRouter.url).toBe('/dashboard');
      expect(reloadWasCalled).toBe(false);

      componentInstance.onWindowFocus = originalComponent;
    });
  });
});
