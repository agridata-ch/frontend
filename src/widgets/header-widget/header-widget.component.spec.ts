import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { AuthService, UserData } from '@/shared/lib/auth';
import { MockAuthService } from '@/shared/testing/mocks';
import { HeaderWidgetComponent } from '@/widgets/header-widget';

describe('HeaderWidgetComponent', () => {
  let fixture: ComponentFixture<HeaderWidgetComponent>;
  let component: HeaderWidgetComponent;
  let authService: AuthService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeaderWidgetComponent, RouterLink],
      providers: [
        { provide: AuthService, useClass: MockAuthService },
        { provide: ActivatedRoute, useValue: {} },
      ],
    }).compileComponents();

    authService = TestBed.inject(AuthService);
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
    jest.spyOn(authService, 'isAuthenticated').mockReturnValue(false);
    createComponent();
    expect(component.isAuthenticated()).toBe(false);

    jest.spyOn(authService, 'isAuthenticated').mockReturnValue(true);
    createComponent();
    expect(component.isAuthenticated()).toBe(true);
  });

  it('userData signal reflects AuthService.userData()', () => {
    const fakeUser: UserData = {
      name: 'Alice',
      email: 'alice@example.com',
      sub: '123',
      preferred_username: 'alice',
      given_name: 'Alice',
      family_name: 'Smith',
      uid: 123,
      loginid: 'alice123',
    };
    jest.spyOn(authService, 'userData').mockReturnValue(fakeUser);
    createComponent();
    expect(component.userData()).toBe(fakeUser);

    jest.spyOn(authService, 'userData').mockReturnValue(null);
    createComponent();
    expect(component.userData()).toBeNull();
  });

  it('login() calls AuthService.login()', () => {
    jest.spyOn(authService, 'login');
    createComponent();
    component.login();
    expect(authService.login).toHaveBeenCalled();
  });
});
