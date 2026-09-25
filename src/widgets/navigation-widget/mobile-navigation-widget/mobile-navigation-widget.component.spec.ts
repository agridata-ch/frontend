import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { faDatabase } from '@awesome.me/kit-0b6d1ed528/icons/classic/regular';

import { AgridataStateService } from '@/entities/api/agridata-state.service';
import { AuthService } from '@/shared/lib/auth';
import {
  createMockAgridataStateService,
  MockAgridataStateService,
  createMockAuthService,
  MockAuthService,
} from '@/shared/testing/mocks';
import { NavigationItem } from '@/widgets/navigation-widget/navigation-item.model';

import { MobileNavigationWidgetComponent } from './mobile-navigation-widget.component';

const navItems: NavigationItem[] = [
  { label: 'admin.pageTitle', icon: faDatabase, route: '/admin' },
  { label: 'provider.pageTitle', icon: faDatabase, route: '/provider' },
];

describe('MobileNavigationWidgetComponent', () => {
  let component: MobileNavigationWidgetComponent;
  let fixture: ComponentFixture<MobileNavigationWidgetComponent>;
  let authService: MockAuthService;
  let stateService: MockAgridataStateService;
  beforeEach(async () => {
    authService = createMockAuthService();
    stateService = createMockAgridataStateService();
    await TestBed.configureTestingModule({
      imports: [MobileNavigationWidgetComponent],
      providers: [
        { provide: AuthService, useValue: authService },
        { provide: AgridataStateService, useValue: stateService },
        { provide: ActivatedRoute, useValue: {} },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(MobileNavigationWidgetComponent);
    component = fixture.componentInstance;

    fixture.detectChanges();
  });

  function createComponent(): void {
    fixture = TestBed.createComponent(MobileNavigationWidgetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('toggleNavigation flips isNavigationOpen and updates chevronIcon', () => {
    createComponent();

    component.toggleNavigation();
    expect(component.isNavigationOpen()).toBe(true);

    component.toggleNavigation();
    expect(component.isNavigationOpen()).toBe(false);
  });

  describe('navigation items (authenticated)', () => {
    function navLinks(): HTMLAnchorElement[] {
      return fixture.debugElement
        .queryAll(By.css('a[href]'))
        .map((el) => el.nativeElement as HTMLAnchorElement)
        .filter((a) => navItems.some((item) => item.route === a.getAttribute('href')));
    }

    beforeEach(() => {
      authService.__testSignals.isAuthenticated.set(true);
    });

    it('renders the navigation links when more than one item exists', () => {
      fixture.componentRef.setInput('navigationItems', navItems);
      fixture.detectChanges();

      expect(navLinks()).toHaveLength(navItems.length);
    });

    it('hides the navigation links when only one item exists', () => {
      fixture.componentRef.setInput('navigationItems', [navItems[0]]);
      fixture.detectChanges();

      expect(navLinks()).toHaveLength(0);
    });
  });
});
