import { TestBed, ComponentFixture } from '@angular/core/testing';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { IconDefinition } from '@fortawesome/free-regular-svg-icons';

import { NavigationWidgetComponent } from './navigation-widget.component';
import { AuthService } from '@/shared/services/auth.service';

describe('NavigationWidgetComponent', () => {
  let fixture: ComponentFixture<NavigationWidgetComponent>;
  let component: NavigationWidgetComponent;

  // Minimal AuthService stub.
  let mockAuthService: {
    isAuthenticated: jest.Mock<boolean, []>;
    userRoles: jest.Mock<string[], []>;
  };

  beforeEach(async () => {
    mockAuthService = {
      isAuthenticated: jest.fn().mockReturnValue(false),
      userRoles: jest.fn().mockReturnValue([]),
    };

    await TestBed.configureTestingModule({
      imports: [NavigationWidgetComponent, RouterLink, RouterLinkActive, FontAwesomeModule],
      providers: [{ provide: AuthService, useValue: mockAuthService }],
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
    mockAuthService.isAuthenticated.mockReturnValue(false);
    createComponent();
    expect(component.showNavigation()).toBe(false);
  });

  it('showNavigation is true when AuthService.isAuthenticated() returns true', () => {
    mockAuthService.isAuthenticated.mockReturnValue(true);
    createComponent();
    expect(component.showNavigation()).toBe(true);
  });

  it('userRoles reflects AuthService.userRoles()', () => {
    mockAuthService.userRoles.mockReturnValue(['foo', 'bar']);
    createComponent();
    expect(component.userRoles()).toEqual(['foo', 'bar']);
  });

  describe('navigationItems', () => {
    it('returns [false] when userRoles does not include the specific role', () => {
      mockAuthService.userRoles.mockReturnValue(['some.other.role']);
      createComponent();

      const items = component.navigationItems();
      expect(Array.isArray(items)).toBe(true);
      expect(items.length).toBe(1);
      expect(items[0]).toBe(false);
    });

    it('returns the navigation object when userRoles includes "agridata.ch.Agridata_Einwilliger"', () => {
      mockAuthService.userRoles.mockReturnValue([
        'agridata.ch.Agridata_Einwilliger',
        'another.role',
      ]);
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
      expect(navItem.route).toBe('/consent-requests');
    });
  });
});
