import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { FontAwesomeModule, IconDefinition } from '@fortawesome/angular-fontawesome';

import { ROUTE_PATHS, USER_ROLES } from '@/shared/constants/constants';
import { AuthService } from '@/shared/lib/auth';
import { createMockAuthService, MockAuthService } from '@/shared/testing/mocks/mock-auth-service';
import { NavigationWidgetComponent } from '@/widgets/navigation-widget';

describe('NavigationWidgetComponent', () => {
  let fixture: ComponentFixture<NavigationWidgetComponent>;
  let component: NavigationWidgetComponent;
  let authService: MockAuthService;

  beforeEach(async () => {
    authService = createMockAuthService();

    await TestBed.configureTestingModule({
      imports: [NavigationWidgetComponent, RouterLink, RouterLinkActive, FontAwesomeModule],
      providers: [{ provide: AuthService, useValue: authService }],
    }).compileComponents();
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
    authService.isAuthenticated.set(false);
    createComponent();
    expect(component.showNavigation()).toBe(false);
  });

  it('showNavigation is true when AuthService.isAuthenticated() returns true', () => {
    authService.isAuthenticated.set(true);
    createComponent();
    expect(component.showNavigation()).toBe(true);
  });

  it('userRoles reflects AuthService.userRoles()', () => {
    const roles = ['foo', 'bar'];
    authService.userRoles.set(roles);
    createComponent();
    expect(component.userRoles()).toEqual(roles);
  });

  describe('navigationItems', () => {
    it('returns empty array when userRoles does not include the specific role', () => {
      authService.userRoles.set(['some.other.role']);
      createComponent();

      const items = component.navigationItems();
      expect(Array.isArray(items)).toBe(true);
      expect(items.length).toBe(0);
    });

    it('returns the navigation object when userRoles includes "agridata.ch.Agridata_Einwilliger"', () => {
      authService.userRoles.set([USER_ROLES.AGRIDATA_CONSENT_REQUESTS_PRODUCER, 'another.role']);
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
