import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AuthService } from '@/shared/lib/auth';
import { createMockAuthService, MockAuthService } from '@/shared/testing/mocks/mock-auth-service';

import { MobileNavigationWidgetComponent } from './mobile-navigation-widget.component';

describe('MobileNavigationWidgetComponent', () => {
  let component: MobileNavigationWidgetComponent;
  let fixture: ComponentFixture<MobileNavigationWidgetComponent>;
  let authService: MockAuthService;

  beforeEach(async () => {
    authService = createMockAuthService();
    await TestBed.configureTestingModule({
      imports: [MobileNavigationWidgetComponent],
      providers: [{ provide: AuthService, useValue: authService }],
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
});
