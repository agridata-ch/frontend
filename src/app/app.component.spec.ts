import { ViewportScroller } from '@angular/common';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Event, NavigationEnd, Router, Scroll, provideRouter } from '@angular/router';
import { Subject } from 'rxjs';

import { AppComponent } from './app.component';

describe('AppComponent', () => {
  let component: AppComponent;
  let mockRouter: Partial<Router>;
  let mockViewportScroller: Partial<ViewportScroller>;
  let routerEvents: Subject<Event>;

  beforeEach(async () => {
    jest.useFakeTimers();

    routerEvents = new Subject<Event>();

    mockRouter = {
      events: routerEvents.asObservable(),
    };

    mockViewportScroller = {
      scrollToAnchor: jest.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: Router, useValue: mockRouter },
        { provide: ViewportScroller, useValue: mockViewportScroller },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  it('should create the app', () => {
    expect(component).toBeTruthy();
  });

  it('should update currentAnchor signal when router emits Scroll event with anchor', () => {
    const testAnchor = 'test-section';

    routerEvents.next(new Scroll(new NavigationEnd(1, '/', '/'), [0, 0], testAnchor));

    expect(component['currentAnchor']()).toBe(testAnchor);
  });

  it('should not update currentAnchor when router emits Scroll event without anchor', () => {
    component['currentAnchor'].set('initial-anchor');

    routerEvents.next(new Scroll(new NavigationEnd(1, '/', '/'), [0, 0], null));

    expect(component['currentAnchor']()).toBe('initial-anchor');
  });

  it('should scroll to anchor when currentAnchor changes', async () => {
    const mockElement = document.createElement('div');
    jest.spyOn(document, 'getElementById').mockReturnValue(mockElement);

    const mockRect = { top: 0 } as DOMRect;
    jest.spyOn(mockElement, 'getBoundingClientRect').mockReturnValue(mockRect);

    component['currentAnchor'].set('test-section');

    jest.advanceTimersByTime(150);

    expect(mockViewportScroller.scrollToAnchor).toHaveBeenCalledWith('test-section');
  });

  it('should do nothing if element with anchor ID is not found', async () => {
    jest.spyOn(document, 'getElementById').mockReturnValue(null);

    component['currentAnchor'].set('nonexistent-section');

    jest.advanceTimersByTime(150);

    expect(mockViewportScroller.scrollToAnchor).not.toHaveBeenCalled();
  });
});
