import { TestBed } from '@angular/core/testing';
import { of, Subject } from 'rxjs';
import { OidcSecurityService } from 'angular-auth-oidc-client';
import { HeaderWidgetComponent } from './header-widget.component';

interface UserData {
  sub?: string;
  name?: string;
  preferred_username?: string;
  email?: string;
}

describe('HeaderWidgetComponent', () => {
  let component: HeaderWidgetComponent;
  let mockOidc: {
    checkAuth: jest.Mock;
    authorize: jest.Mock;
    logoff: jest.Mock;
  };

  beforeEach(() => {
    mockOidc = {
      checkAuth: jest.fn(),
      authorize: jest.fn(),
      logoff: jest.fn(),
    };

    TestBed.configureTestingModule({
      providers: [HeaderWidgetComponent, { provide: OidcSecurityService, useValue: mockOidc }],
    });

    component = TestBed.inject(HeaderWidgetComponent);
  });

  it('initial signals: isAuthenticated=false and userData=null', () => {
    expect(component.isAuthenticated()).toBe(false);
    expect(component.userData()).toBeNull();
  });

  it('ngOnInit sets signals when checkAuth emits authenticated=true', () => {
    const fakeUser: UserData = { name: 'Alice', email: 'alice@example.com' };
    // simulate checkAuth() returning an observable that emits once
    mockOidc.checkAuth.mockReturnValue(of({ isAuthenticated: true, userData: fakeUser }));
    component.ngOnInit();
    expect(component.isAuthenticated()).toBe(true);
    expect(component.userData()).toEqual(fakeUser);
  });

  it('ngOnInit sets isAuthenticated=false and leaves userData null when not authenticated', () => {
    // userData should not be set if isAuthenticated is false
    mockOidc.checkAuth.mockReturnValue(of({ isAuthenticated: false, userData: { name: 'Bob' } }));
    component.userData.set({ name: 'PreExisting' }); // set something first
    component.ngOnInit();
    expect(component.isAuthenticated()).toBe(false);
    expect(component.userData()).toBeNull();
  });

  it('handles delayed emission from checkAuth (async)', () => {
    const subject = new Subject<{ isAuthenticated: boolean; userData: UserData }>();
    mockOidc.checkAuth.mockReturnValue(subject.asObservable());
    component.ngOnInit();
    // before emission
    expect(component.isAuthenticated()).toBe(false);
    expect(component.userData()).toBeNull();
    // emit now
    const delayedUser: UserData = { preferred_username: 'delayed' };
    subject.next({ isAuthenticated: true, userData: delayedUser });
    expect(component.isAuthenticated()).toBe(true);
    expect(component.userData()).toEqual(delayedUser);
  });

  it('login() calls authorize()', () => {
    component.login();
    expect(mockOidc.authorize).toHaveBeenCalled();
  });

  it('logout() calls logoff() and clears sessionStorage', () => {
    const logoffSubject = new Subject<void>();
    mockOidc.logoff.mockReturnValue(logoffSubject.asObservable());
    const originalClear = window.sessionStorage.clear;
    const clearMock = jest.fn();
    window.sessionStorage.clear = clearMock;
    component.logout();
    expect(mockOidc.logoff).toHaveBeenCalled();
    logoffSubject.next();
    logoffSubject.complete();
    // Wait for microtasks to complete before asserting
    setTimeout(() => {
      expect(clearMock).toHaveBeenCalled();
      window.sessionStorage.clear = originalClear;
    }, 0);
  });
});
