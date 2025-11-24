import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';

import { AgridataStateService } from '@/entities/api/agridata-state.service';
import { AuthService } from '@/shared/lib/auth';
import {
  createMockAgridataStateService,
  MockAgridataStateService,
} from '@/shared/testing/mocks/mock-agridata-state-service';
import { createMockAuthService, MockAuthService } from '@/shared/testing/mocks/mock-auth-service';

import { MobileNavigationWidgetComponent } from './mobile-navigation-widget.component';

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
});
