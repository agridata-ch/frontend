import { Component, Input, NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { AgridataFlipRowDirective } from './agridata-table.directive';

@Component({
  standalone: true,
  template: `
    <tr agridataFlipRow [rowId]="rowId" [rowData]="rowData" [totalRows]="totalRows"></tr>
  `,
  imports: [AgridataFlipRowDirective],
  schemas: [NO_ERRORS_SCHEMA],
})
class TestHostComponent {
  @Input() rowId = '1';
  @Input() totalRows = 1;
}

describe('AgridataFlipRowDirective', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let tr: HTMLElement;
  let directive: AgridataFlipRowDirective;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TestHostComponent],
    });
    fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();
    tr = fixture.debugElement.query(By.directive(AgridataFlipRowDirective)).nativeElement;
    directive = fixture.debugElement
      .query(By.directive(AgridataFlipRowDirective))
      .injector.get(AgridataFlipRowDirective);
  });

  it('should create the directive', () => {
    expect(directive).toBeTruthy();
  });

  it('should remove highlight after timeout', () => {
    jest.useFakeTimers();
    fixture.detectChanges();
    directive.ngDoCheck();
    jest.advanceTimersByTime(5000);
    directive.ngDoCheck();
    jest.useRealTimers();
  });

  it('should trigger FLIP animation only if row moves and totalRows is unchanged', () => {
    // Simulate previous state
    (directive as unknown as { previousTop: number }).previousTop = 100;
    (directive as unknown as { previousRowId: string }).previousRowId = '1';
    (directive as unknown as { previousTotalRows: number }).previousTotalRows = 1;
    (directive as unknown as { firstCheck: boolean }).firstCheck = false;

    // Simulate move
    Object.defineProperty(tr, 'getBoundingClientRect', {
      value: () => ({ top: 50 }),
    });

    directive.ngDoCheck();

    expect(tr.style.transform).toContain('translateY');
  });

  it('should not trigger animation for small movements under threshold', () => {
    // Simulate previous state with a small difference
    (directive as unknown as { previousTop: number }).previousTop = 100;
    (directive as unknown as { previousRowId: string }).previousRowId = '1';
    (directive as unknown as { previousTotalRows: number }).previousTotalRows = 1;
    (directive as unknown as { firstCheck: boolean }).firstCheck = false;

    // Small movement that's under threshold (set as private readonly POSITION_THRESHOLD = 2)
    Object.defineProperty(tr, 'getBoundingClientRect', {
      value: () => ({ top: 99 }), // Just 1px difference
    });

    directive.ngDoCheck();

    // No transform should be applied for small movements
    expect(tr.style.transform).not.toContain('translateY');
  });

  it('should not trigger animation when row ID changes', () => {
    // Simulate previous state with different rowId
    (directive as unknown as { previousTop: number }).previousTop = 100;
    (directive as unknown as { previousRowId: string }).previousRowId = '2'; // Different rowId
    (directive as unknown as { previousTotalRows: number }).previousTotalRows = 1;
    (directive as unknown as { firstCheck: boolean }).firstCheck = false;

    Object.defineProperty(tr, 'getBoundingClientRect', {
      value: () => ({ top: 50 }),
    });

    directive.ngDoCheck();

    // No animation should be triggered when rowId changes
    expect(tr.style.transform).not.toContain('translateY');
  });

  it('should not trigger animation when totalRows changes', () => {
    // Simulate previous state with different totalRows
    (directive as unknown as { previousTop: number }).previousTop = 100;
    (directive as unknown as { previousRowId: string }).previousRowId = '1';
    (directive as unknown as { previousTotalRows: number }).previousTotalRows = 2; // Different totalRows
    (directive as unknown as { firstCheck: boolean }).firstCheck = false;

    Object.defineProperty(tr, 'getBoundingClientRect', {
      value: () => ({ top: 50 }),
    });

    directive.ngDoCheck();

    // No animation should be triggered when totalRows changes
    expect(tr.style.transform).not.toContain('translateY');
  });

  it('should debounce animations', () => {
    // Setup directive state
    (directive as unknown as { previousTop: number }).previousTop = 100;
    (directive as unknown as { previousRowId: string }).previousRowId = '1';
    (directive as unknown as { previousTotalRows: number }).previousTotalRows = 1;
    (directive as unknown as { firstCheck: boolean }).firstCheck = false;
    (directive as unknown as { lastAnimationTime: number }).lastAnimationTime = Date.now(); // Recent animation

    Object.defineProperty(tr, 'getBoundingClientRect', {
      value: () => ({ top: 50 }),
    });

    directive.ngDoCheck();

    // Animation should be debounced and not triggered
    expect(tr.style.transform).not.toContain('translateY');
  });

  it('should skip animation when directive is animating', () => {
    // Set directive as currently animating
    (directive as unknown as { previousTop: number }).previousTop = 100;
    (directive as unknown as { previousRowId: string }).previousRowId = '1';
    (directive as unknown as { previousTotalRows: number }).previousTotalRows = 1;
    (directive as unknown as { firstCheck: boolean }).firstCheck = false;
    (directive as unknown as { isAnimating: boolean }).isAnimating = true;

    Object.defineProperty(tr, 'getBoundingClientRect', {
      value: () => ({ top: 50 }),
    });

    directive.ngDoCheck();

    // No transform should be applied when already animating
    expect(tr.style.transform).not.toContain('translateY');
  });

  it('should skip animation when page is scrolling', () => {
    // Set directive as currently scrolling
    (directive as unknown as { previousTop: number }).previousTop = 100;
    (directive as unknown as { previousRowId: string }).previousRowId = '1';
    (directive as unknown as { previousTotalRows: number }).previousTotalRows = 1;
    (directive as unknown as { firstCheck: boolean }).firstCheck = false;
    (directive as unknown as { isScrolling: boolean }).isScrolling = true;

    Object.defineProperty(tr, 'getBoundingClientRect', {
      value: () => ({ top: 50 }),
    });

    directive.ngDoCheck();

    // No transform should be applied when scrolling
    expect(tr.style.transform).not.toContain('translateY');
  });

  it('should clean up event listeners on destroy', () => {
    const removeEventListenerSpy = jest.spyOn(window, 'removeEventListener');

    directive.ngOnDestroy();

    expect(removeEventListenerSpy).toHaveBeenCalledWith('scroll', expect.any(Function));
    removeEventListenerSpy.mockRestore();
  });

  it('should clear timeout on destroy', () => {
    jest.useFakeTimers();
    const clearTimeoutSpy = jest.spyOn(window, 'clearTimeout');

    // Create a timeout
    (directive as unknown as { scrollTimeout: ReturnType<typeof setTimeout> }).scrollTimeout =
      setTimeout(() => {}, 1000);

    directive.ngOnDestroy();

    expect(clearTimeoutSpy).toHaveBeenCalled();
    clearTimeoutSpy.mockRestore();
    jest.useRealTimers();
  });

  describe('ngAfterViewInit', () => {
    it('should initialize previous state correctly', () => {
      // Reset the directive state
      (directive as unknown as { previousTop: number | null }).previousTop = null;
      (directive as unknown as { previousRowId: string | null }).previousRowId = null;
      (directive as unknown as { previousTotalRows: number | null }).previousTotalRows = null;
      (directive as unknown as { firstCheck: boolean }).firstCheck = true;

      // Mock getBoundingClientRect
      const mockTop = 150;
      const getBoundingClientRectSpy = jest.spyOn(tr, 'getBoundingClientRect').mockReturnValue({
        top: mockTop,
        bottom: 0,
        height: 0,
        left: 0,
        right: 0,
        width: 0,
        x: 0,
        y: 0,
        toJSON: () => ({}),
      });

      // Call ngAfterViewInit
      directive.ngAfterViewInit();

      // Verify state was initialized correctly
      expect((directive as unknown as { previousTop: number }).previousTop).toBe(mockTop);
      expect((directive as unknown as { previousRowId: string }).previousRowId).toBe('1'); // Default value from TestHostComponent
      expect((directive as unknown as { previousTotalRows: number }).previousTotalRows).toBe(1); // Default value from TestHostComponent
      expect((directive as unknown as { firstCheck: boolean }).firstCheck).toBe(false);

      getBoundingClientRectSpy.mockRestore();
    });

    it('should add scroll event listener', () => {
      const addEventListenerSpy = jest.spyOn(window, 'addEventListener');

      directive.ngAfterViewInit();

      expect(addEventListenerSpy).toHaveBeenCalledWith('scroll', expect.any(Function), {
        passive: true,
      });

      addEventListenerSpy.mockRestore();
    });

    it('should set isScrolling flag true when scroll event fires', () => {
      jest.useFakeTimers();
      directive.ngAfterViewInit();

      // Get the registered scroll listener and call it
      const scrollListener = (directive as unknown as { scrollListener: () => void })
        .scrollListener;
      expect(scrollListener).toBeTruthy();

      // Before scroll
      expect((directive as unknown as { isScrolling: boolean }).isScrolling).toBe(false);

      // Trigger scroll event
      scrollListener();

      // After scroll
      expect((directive as unknown as { isScrolling: boolean }).isScrolling).toBe(true);

      jest.useRealTimers();
    });

    it('should clear previous timeout on new scroll event', () => {
      jest.useFakeTimers();
      const clearTimeoutSpy = jest.spyOn(window, 'clearTimeout');

      directive.ngAfterViewInit();

      // Set a mock timeout
      (directive as unknown as { scrollTimeout: ReturnType<typeof setTimeout> }).scrollTimeout =
        setTimeout(() => {}, 1000);

      // Get and call the scroll listener
      const scrollListener = (directive as unknown as { scrollListener: () => void })
        .scrollListener;
      scrollListener();

      expect(clearTimeoutSpy).toHaveBeenCalled();

      clearTimeoutSpy.mockRestore();
      jest.useRealTimers();
    });

    it('should set isScrolling to false after timeout', () => {
      jest.useFakeTimers();
      const getBoundingClientRectSpy = jest.spyOn(tr, 'getBoundingClientRect').mockReturnValue({
        top: 200,
        bottom: 0,
        height: 0,
        left: 0,
        right: 0,
        width: 0,
        x: 0,
        y: 0,
        toJSON: () => ({}),
      });

      directive.ngAfterViewInit();

      // Get and call the scroll listener
      const scrollListener = (directive as unknown as { scrollListener: () => void })
        .scrollListener;
      scrollListener();

      // Before timeout completion
      expect((directive as unknown as { isScrolling: boolean }).isScrolling).toBe(true);

      // Advance timers
      jest.advanceTimersByTime(150);

      // After timeout completion
      expect((directive as unknown as { isScrolling: boolean }).isScrolling).toBe(false);

      // Should update position after scrolling
      expect((directive as unknown as { previousTop: number }).previousTop).toBe(200);

      getBoundingClientRectSpy.mockRestore();
      jest.useRealTimers();
    });

    it('should update previous state after scrolling stops', () => {
      jest.useFakeTimers();

      // Initial state
      (directive as unknown as { previousTop: number }).previousTop = 100;

      // Mock the element's new position after scroll
      const mockTop = 250;
      const getBoundingClientRectSpy = jest.spyOn(tr, 'getBoundingClientRect').mockReturnValue({
        top: mockTop,
        bottom: 0,
        height: 0,
        left: 0,
        right: 0,
        width: 0,
        x: 0,
        y: 0,
        toJSON: () => ({}),
      });

      directive.ngAfterViewInit();

      // Trigger scroll
      const scrollListener = (directive as unknown as { scrollListener: () => void })
        .scrollListener;
      scrollListener();

      // Advance timers to complete the scroll timeout
      jest.advanceTimersByTime(150);

      // Verify previous state was updated
      expect((directive as unknown as { previousTop: number }).previousTop).toBe(mockTop);
      expect((directive as unknown as { isScrolling: boolean }).isScrolling).toBe(false);

      getBoundingClientRectSpy.mockRestore();
      jest.useRealTimers();
    });
  });

  describe('Animation with requestAnimationFrame', () => {
    beforeEach(() => {
      // Set up directive for animation conditions
      (directive as unknown as { previousTop: number }).previousTop = 100;
      (directive as unknown as { previousRowId: string }).previousRowId = '1';
      (directive as unknown as { previousTotalRows: number }).previousTotalRows = 1;
      (directive as unknown as { firstCheck: boolean }).firstCheck = false;
      (directive as unknown as { isAnimating: boolean }).isAnimating = false;
      (directive as unknown as { isScrolling: boolean }).isScrolling = false;
      (directive as unknown as { lastAnimationTime: number }).lastAnimationTime = 0;

      // Mock getBoundingClientRect to return a position that will trigger animation
      Object.defineProperty(tr, 'getBoundingClientRect', {
        value: () => ({ top: 50 }), // 50px difference from previousTop
      });
    });

    it('should call requestAnimationFrame when animation conditions are met', () => {
      const requestAnimationFrameSpy = jest.spyOn(window, 'requestAnimationFrame');

      // Trigger animation via ngDoCheck
      directive.ngDoCheck();

      // Check that requestAnimationFrame was called
      expect(requestAnimationFrameSpy).toHaveBeenCalled();

      requestAnimationFrameSpy.mockRestore();
    });

    it('should set transform and transition styles correctly during animation', () => {
      // Track style changes
      let initialTransition = '';
      let initialTransform = '';
      let finalTransition = '';
      let finalTransform = '';

      // Mock requestAnimationFrame to capture styles at different stages
      const requestAnimationFrameMock = jest
        .spyOn(window, 'requestAnimationFrame')
        .mockImplementation((callback: FrameRequestCallback) => {
          // Capture initial styles set before requestAnimationFrame
          initialTransition = tr.style.transition;
          initialTransform = tr.style.transform;

          // Execute the callback (which changes styles again)
          callback(0);

          // Capture the final styles set inside requestAnimationFrame
          finalTransition = tr.style.transition;
          finalTransform = tr.style.transform;

          return 0;
        });

      // Trigger animation
      directive.ngDoCheck();

      // First phase: immediate transform without transition
      expect(initialTransition).toBe('none');
      expect(initialTransform).toContain('translateY(50px)'); // 100 - 50 = 50

      // Second phase (inside requestAnimationFrame): transition style and reset transform
      expect(finalTransition).toBe('transform 800ms cubic-bezier(.4,0,.2,1)');
      expect(finalTransform).toBe('');

      requestAnimationFrameMock.mockRestore();
    });

    it('should add transitionend event listener during animation', () => {
      const addEventListenerSpy = jest.spyOn(tr, 'addEventListener');

      // Mock requestAnimationFrame to execute the callback immediately
      const requestAnimationFrameMock = jest
        .spyOn(window, 'requestAnimationFrame')
        .mockImplementation((callback: FrameRequestCallback) => {
          callback(0);
          return 0;
        });

      // Trigger animation
      directive.ngDoCheck();

      // Verify transitionend listener was added
      expect(addEventListenerSpy).toHaveBeenCalledWith('transitionend', expect.any(Function));

      addEventListenerSpy.mockRestore();
      requestAnimationFrameMock.mockRestore();
    });

    it('should reset isAnimating flag when transitionend event fires', () => {
      let transitionEndHandler: () => void = () => {};

      // Spy on addEventListener to capture the transitionend handler
      jest.spyOn(tr, 'addEventListener').mockImplementation((event, handler) => {
        if (event === 'transitionend') {
          transitionEndHandler = handler as () => void;
        }
      });

      // Mock requestAnimationFrame to execute the callback immediately
      const requestAnimationFrameMock = jest
        .spyOn(window, 'requestAnimationFrame')
        .mockImplementation((callback: FrameRequestCallback) => {
          callback(0);
          return 0;
        });

      // Trigger animation
      directive.ngDoCheck();

      // Verify isAnimating is true during animation
      expect((directive as unknown as { isAnimating: boolean }).isAnimating).toBe(true);

      // Trigger the transitionend event
      transitionEndHandler();

      // Verify isAnimating was reset
      expect((directive as unknown as { isAnimating: boolean }).isAnimating).toBe(false);

      requestAnimationFrameMock.mockRestore();
    });

    it('should remove transitionend event listener after it fires', () => {
      let transitionEndHandler: () => void = () => {};

      // Spy on addEventListener to capture the handler
      jest.spyOn(tr, 'addEventListener').mockImplementation((event, handler) => {
        if (event === 'transitionend') {
          transitionEndHandler = handler as () => void;
        }
      });

      // Spy on removeEventListener to verify it's called
      const removeEventListenerSpy = jest.spyOn(tr, 'removeEventListener');

      // Mock requestAnimationFrame
      const requestAnimationFrameMock = jest
        .spyOn(window, 'requestAnimationFrame')
        .mockImplementation((callback: FrameRequestCallback) => {
          callback(0);
          return 0;
        });

      // Trigger animation
      directive.ngDoCheck();

      // Trigger transitionend
      transitionEndHandler();

      // Verify listener was removed
      expect(removeEventListenerSpy).toHaveBeenCalledWith('transitionend', transitionEndHandler);

      removeEventListenerSpy.mockRestore();
      requestAnimationFrameMock.mockRestore();
    });

    it('should use fallback timeout to reset animation state if transitionend doesnt fire', () => {
      jest.useFakeTimers();

      // Mock requestAnimationFrame to execute the callback immediately
      const requestAnimationFrameMock = jest
        .spyOn(window, 'requestAnimationFrame')
        .mockImplementation((callback: FrameRequestCallback) => {
          callback(0);
          return 0;
        });

      // Trigger animation
      directive.ngDoCheck();

      // Verify isAnimating is true during animation
      expect((directive as unknown as { isAnimating: boolean }).isAnimating).toBe(true);

      // Advance timer past the fallback timeout (850ms)
      jest.advanceTimersByTime(851);

      // Verify isAnimating was reset by the fallback
      expect((directive as unknown as { isAnimating: boolean }).isAnimating).toBe(false);

      requestAnimationFrameMock.mockRestore();
      jest.useRealTimers();
    });
  });
});
