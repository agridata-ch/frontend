import { TestBed, ComponentFixture } from '@angular/core/testing';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { HeaderWidgetComponent } from './header-widget.component';
import { AuthService, UserData } from '@/shared/services/auth.service';

describe('HeaderWidgetComponent', () => {
  let fixture: ComponentFixture<HeaderWidgetComponent>;
  let component: HeaderWidgetComponent;

  let mockAuthService: {
    isAuthenticated: jest.Mock<boolean, []>;
    userData: jest.Mock<UserData | null, []>;
    login: jest.Mock<void, []>;
    logout: jest.Mock<void, []>;
  };

  beforeEach(async () => {
    mockAuthService = {
      isAuthenticated: jest.fn().mockReturnValue(false),
      userData: jest.fn().mockReturnValue(null),
      login: jest.fn(),
      logout: jest.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [HeaderWidgetComponent, RouterLink],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: ActivatedRoute, useValue: {} },
      ],
    }).compileComponents();
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

  it('isAuthenticated signal reflects AuthService.isAuthenticated()', () => {
    mockAuthService.isAuthenticated.mockReturnValue(false);
    createComponent();
    expect(component.isAuthenticated()).toBe(false);

    mockAuthService.isAuthenticated.mockReturnValue(true);
    createComponent();
    expect(component.isAuthenticated()).toBe(true);
  });

  it('userData signal reflects AuthService.userData()', () => {
    const fakeUser: UserData = { name: 'Alice', email: 'alice@example.com' };
    mockAuthService.userData.mockReturnValue(fakeUser);
    createComponent();
    expect(component.userData()).toBe(fakeUser);

    mockAuthService.userData.mockReturnValue(null);
    createComponent();
    expect(component.userData()).toBeNull();
  });

  it('login() calls AuthService.login()', () => {
    createComponent();
    component.login();
    expect(mockAuthService.login).toHaveBeenCalled();
  });

  it('logout() calls AuthService.logout()', () => {
    createComponent();
    component.logout();
    expect(mockAuthService.logout).toHaveBeenCalled();
  });
});
