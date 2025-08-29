import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { IconDefinition } from '@fortawesome/free-regular-svg-icons';

import { ROUTE_PATHS, USER_ROLES } from '@/shared/constants/constants';
import { AuthService } from '@/shared/lib/auth';
import { MockAuthService } from '@/shared/testing/mocks';
import { NavigationWidgetComponent } from '@/widgets/navigation-widget';

describe('NavigationWidgetComponent', () => {
  let fixture: ComponentFixture<NavigationWidgetComponent>;
  let component: NavigationWidgetComponent;
  let mockAuthService: AuthService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NavigationWidgetComponent, RouterLink, RouterLinkActive, FontAwesomeModule],
      providers: [{ provide: AuthService, useClass: MockAuthService }],
    }).compileComponents();

    mockAuthService = TestBed.inject(AuthService);
  });

  function createComponent(): void {
    fixture = TestBed.createComponent(NavigationWidgetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  it('should create', () => {
    createComponent();
    expect(component).toBeTruthy();
  });

  it('navigation is closed by default', () => {
    createComponent();
    expect(component.isNavigationOpen()).toBe(false);
  });

  it('toggleNavigation flips isNavigationOpen and updates chevronIcon', () => {
    createComponent();

    component.toggleNavigation();
    expect(component.isNavigationOpen()).toBe(true);

    component.toggleNavigation();
    expect(component.isNavigationOpen()).toBe(false);
  });

  it('showNavigation is false when AuthService.isAuthenticated() returns false', () => {
    jest.spyOn(mockAuthService, 'isAuthenticated').mockReturnValue(false);
    createComponent();
    expect(component.showNavigation()).toBe(false);
  });

  it('showNavigation is true when AuthService.isAuthenticated() returns true', () => {
    jest.spyOn(mockAuthService, 'isAuthenticated').mockReturnValue(true);
    createComponent();
    expect(component.showNavigation()).toBe(true);
  });

  it('userRoles reflects AuthService.userRoles()', () => {
    const roles = ['foo', 'bar'];
    jest.spyOn(mockAuthService, 'userRoles').mockReturnValue(roles);
    createComponent();
    expect(component.userRoles()).toEqual(roles);
  });

  describe('navigationItems', () => {
    it('returns empty array when userRoles does not include the specific role', () => {
      jest.spyOn(mockAuthService, 'userRoles').mockReturnValue(['some.other.role']);
      createComponent();

      const items = component.navigationItems();
      expect(Array.isArray(items)).toBe(true);
      expect(items.length).toBe(0);
    });

    it('returns the navigation object when userRoles includes "agridata.ch.Agridata_Einwilliger"', () => {
      jest
        .spyOn(mockAuthService, 'userRoles')
        .mockReturnValue([USER_ROLES.AGRIDATA_CONSENT_REQUESTS_PRODUCER, 'another.role']);
      createComponent();

      const items = component.navigationItems();
      expect(Array.isArray(items)).toBe(true);
      expect(items.length).toBe(1);

      const navItem = items[0] as {
        label: string;
        icon: IconDefinition;
        route: string;
      };
      expect(navItem).not.toBe(false);
      expect(navItem.route).toBe(`/${ROUTE_PATHS.CONSENT_REQUEST_PRODUCER_PATH}`);
    });
  });
});
