import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { CmsService } from '@/entities/cms';
import { UserInfoDto } from '@/entities/openapi';
import { AuthService } from '@/shared/lib/auth';
import { MockAuthService, mockCmsService } from '@/shared/testing/mocks';
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
        { provide: CmsService, useValue: mockCmsService },
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
    jest.spyOn(authService, 'login');
    createComponent();
    component.login();
    expect(authService.login).toHaveBeenCalled();
  });
});
