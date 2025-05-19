import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { NavigationWidgetComponent } from './navigation-widget.component';
import { faChevronRight, faChevronLeft } from '@fortawesome/free-solid-svg-icons';

describe('NavigationWidgetComponent', () => {
  let fixture: ComponentFixture<NavigationWidgetComponent>;
  let component: NavigationWidgetComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NavigationWidgetComponent],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(NavigationWidgetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('navigation is closed by default', () => {
    expect(component.isNavigationOpen()).toBe(false);
  });

  it('shows chevron-right when closed', () => {
    expect(component.chevronIcon()).toBe(faChevronRight);
  });

  it('toggleNavigation flips isNavigationOpen and updates chevronIcon', () => {
    component.toggleNavigation();
    expect(component.isNavigationOpen()).toBe(true);
    expect(component.chevronIcon()).toBe(faChevronLeft);

    component.toggleNavigation();
    expect(component.isNavigationOpen()).toBe(false);
    expect(component.chevronIcon()).toBe(faChevronRight);
  });
});
