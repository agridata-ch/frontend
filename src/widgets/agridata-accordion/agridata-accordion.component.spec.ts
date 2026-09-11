import { ComponentRef } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { faChevronDown, faChevronUp } from '@awesome.me/kit-0b6d1ed528/icons/classic/regular';

import { TooltipDirective } from '@/shared/tooltip';

import { AgridataAccordionComponent } from './agridata-accordion.component';

describe('AgridataAccordionComponent', () => {
  let fixture: ComponentFixture<AgridataAccordionComponent>;
  let component: AgridataAccordionComponent;
  let openComponent: any;
  let componentRef: ComponentRef<AgridataAccordionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AgridataAccordionComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AgridataAccordionComponent);
    component = fixture.componentInstance;
    componentRef = fixture.componentRef;
    openComponent = component as any;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should have default collapsed state', () => {
    expect(openComponent.isExpanded()).toBe(false);
    expect(openComponent.expandIcon()).toBe(faChevronDown);
  });

  it('should expand when toggleAccordion is called', () => {
    openComponent.toggleAccordion();
    expect(openComponent.isExpanded()).toBe(true);
    expect(openComponent.expandIcon()).toBe(faChevronUp);
  });

  it('should set header and content via setInput', () => {
    componentRef.setInput('header', 'Test Header');
    expect(openComponent.header()).toBe('Test Header');
  });

  it('should offer the header as a tooltip so truncated text stays readable', () => {
    componentRef.setInput('header', 'A header long enough to be clamped');
    fixture.detectChanges();

    const tooltipHost = fixture.debugElement.query(By.directive(TooltipDirective));
    expect(tooltipHost).toBeTruthy();
    expect(tooltipHost.injector.get(TooltipDirective).appTooltip()).toBe(
      'A header long enough to be clamped',
    );
  });

  // Collapsed content keeps its DOM (only height 0), so without inert its links stay tabbable and
  // its text stays readable for screen readers.
  it('should keep the collapsed content out of the a11y tree and announce the toggle state', () => {
    const button = fixture.debugElement.nativeElement.querySelector('button');
    const wrapper = fixture.debugElement.nativeElement.querySelector('button + div');

    expect(button.getAttribute('aria-expanded')).toBe('false');
    expect(wrapper.hasAttribute('inert')).toBe(true);

    openComponent.toggleAccordion();
    fixture.detectChanges();

    expect(button.getAttribute('aria-expanded')).toBe('true');
    expect(wrapper.hasAttribute('inert')).toBe(false);
  });

  it('should call ngAfterViewInit and updateContentHeight on initialization', () => {
    const updateSpy = vi.spyOn(component as any, 'updateContentHeight');
    component.ngAfterViewInit();
    expect(updateSpy).toHaveBeenCalled();
  });

  it('should handle updateContentHeight when expanded', () => {
    // Setup a spy instead of directly using signals
    vi.spyOn(openComponent, 'isExpanded').mockReturnValue(true);

    // Setup mocks for the DOM elements
    openComponent.contentWrapper = {
      nativeElement: { style: { height: '0px' } },
    };
    openComponent.contentInner = {
      nativeElement: { offsetHeight: 100 },
    };

    // Call the method
    openComponent.updateContentHeight();

    // Verify expected behavior
    expect(openComponent.contentWrapper.nativeElement.style.height).toBe('100px');
  });

  it('should not update content height when collapsed', () => {
    // Setup a spy instead of directly using signals
    vi.spyOn(openComponent, 'isExpanded').mockReturnValue(false);

    openComponent.contentWrapper = {
      nativeElement: { style: { height: '0px' } },
    };
    openComponent.contentInner = {
      nativeElement: { offsetHeight: 100 },
    };

    openComponent.updateContentHeight();

    // Should not change height
    expect(openComponent.contentWrapper.nativeElement.style.height).toBe('0px');
  });

  it('should handle case when contentInner is undefined', () => {
    // Setup a spy instead of directly using signals
    vi.spyOn(openComponent, 'isExpanded').mockReturnValue(true);

    openComponent.contentWrapper = {
      nativeElement: { style: { height: '0px' } },
    };
    openComponent.contentInner = undefined;

    // Should not throw an error
    expect(() => openComponent.updateContentHeight()).not.toThrow();
  });

  it('should handle toggle when contentWrapper is undefined during expand', () => {
    // Create a mock for the isExpanded signal that supports both getting and setting
    const originalIsExpanded = openComponent.isExpanded;
    const mockIsExpandedSet = vi.fn();

    // Replace the signal with our mock that returns false and has a set method
    openComponent.isExpanded = function () {
      return false;
    } as any;
    openComponent.isExpanded.set = mockIsExpandedSet;

    // Remove contentWrapper to test the edge case
    openComponent.contentWrapper = undefined;

    try {
      // Call the method under test
      openComponent.toggleAccordion();

      // Verify the signal was set to true
      expect(mockIsExpandedSet).toHaveBeenCalledWith(true);
    } finally {
      // Restore original function
      openComponent.isExpanded = originalIsExpanded;
    }
  });

  describe('toggleAccordion animation handling', () => {
    beforeEach(() => {
      // Setup the references to content elements
      openComponent.contentWrapper = {
        nativeElement: {
          style: { height: '0px' },
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
        },
      };
      openComponent.contentInner = {
        nativeElement: {
          offsetHeight: 100,
        },
      };
    });

    it('should handle expanding animation with proper callbacks', () => {
      // Initial state is collapsed
      expect(openComponent.isExpanded()).toBe(false);

      // Track callback execution
      let animationFrameCallback: ((time: number) => void) | null = null;

      // Mock requestAnimationFrame to capture the callback
      const originalRAF = window.requestAnimationFrame;
      window.requestAnimationFrame = (cb: FrameRequestCallback) => {
        animationFrameCallback = cb;
        return 0;
      };

      // Add transition end handler spy
      const addTransitionSpy = vi.spyOn(openComponent, 'addTransitionEndHandler');

      // Trigger expand
      openComponent.toggleAccordion();

      // Check that isExpanded was set to true
      expect(openComponent.isExpanded()).toBe(true);

      // Now simulate the animation frame callback
      if (animationFrameCallback) {
        (animationFrameCallback as (time: number) => void)(0);

        // Verify height was set correctly
        expect(openComponent.contentWrapper.nativeElement.style.height).toBe('100px');

        // Verify transition handler was added
        expect(addTransitionSpy).toHaveBeenCalled();

        // Simulate the transition end
        const callback = addTransitionSpy.mock.calls[0][0] as () => void;
        callback();

        // Verify auto height was set after transition
        expect(openComponent.contentWrapper.nativeElement.style.height).toBe('auto');
      }

      // Restore original requestAnimationFrame
      window.requestAnimationFrame = originalRAF;
    });

    it('should handle collapsing animation with setTimeout', () => {
      // Create a mock for the isExpanded signal that supports both getting and setting
      const originalIsExpanded = openComponent.isExpanded;
      const mockIsExpandedSet = vi.fn();

      // Replace the signal with our mock that returns true and has a set method
      openComponent.isExpanded = function () {
        return true;
      } as any;
      openComponent.isExpanded.set = mockIsExpandedSet;

      // Setup spies
      const addTransitionSpy = vi.spyOn(openComponent, 'addTransitionEndHandler');

      try {
        // Mock setTimeout
        vi.useFakeTimers();

        // Trigger collapse
        openComponent.toggleAccordion();

        // Should set initial height
        expect(openComponent.contentWrapper.nativeElement.style.height).toBe('100px');

        // Should have added transition handler
        expect(addTransitionSpy).toHaveBeenCalled();

        // Run the setTimeout
        vi.runAllTimers();

        // Should set height to 0
        expect(openComponent.contentWrapper.nativeElement.style.height).toBe('0px');

        // Simulate the transition end
        const callback = addTransitionSpy.mock.calls[0][0] as () => void;
        callback();

        // Verify the set method was called with false
        expect(mockIsExpandedSet).toHaveBeenCalledWith(false);
      } finally {
        // Reset timers and restore original function
        vi.useRealTimers();
        openComponent.isExpanded = originalIsExpanded;
      }
    });

    it('should handle transition end events properly', () => {
      const mockCallback = vi.fn();

      // Call the private method
      openComponent.addTransitionEndHandler(mockCallback);

      // Check that event listener was added
      expect(openComponent.contentWrapper.nativeElement.addEventListener).toHaveBeenCalledWith(
        'transitionend',
        expect.any(Function),
      );

      // Simulate transition end event
      const eventHandler =
        openComponent.contentWrapper.nativeElement.addEventListener.mock.calls[0][1];
      eventHandler();

      // Callback should be called
      expect(mockCallback).toHaveBeenCalled();

      // Event listener should be removed
      expect(openComponent.contentWrapper.nativeElement.removeEventListener).toHaveBeenCalledWith(
        'transitionend',
        eventHandler,
      );
    });

    it('should not add event listener if contentWrapper is undefined', () => {
      // Set contentWrapper to undefined
      openComponent.contentWrapper = undefined;

      const mockCallback = vi.fn();
      openComponent.addTransitionEndHandler(mockCallback);

      // Callback should not be called
      expect(mockCallback).not.toHaveBeenCalled();
    });
  });
});
