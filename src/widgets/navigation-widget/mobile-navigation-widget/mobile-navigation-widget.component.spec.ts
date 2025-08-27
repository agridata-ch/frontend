import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AuthService } from '@/shared/lib/auth';
import { MockAuthService } from '@/shared/testing/mocks';

import { MobileNavigationWidgetComponent } from './mobile-navigation-widget.component';

describe('MobileNavigationWidgetComponent', () => {
  let component: MobileNavigationWidgetComponent;
  let fixture: ComponentFixture<MobileNavigationWidgetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MobileNavigationWidgetComponent],
      providers: [{ provide: AuthService, useClass: MockAuthService }],
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
