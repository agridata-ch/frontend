import {
  AfterViewInit,
  Directive,
  DoCheck,
  ElementRef,
  TemplateRef,
  inject,
  input,
} from '@angular/core';

@Directive({ selector: '[stCell]' })
export class CellTemplateDirective {
  readonly header = input<string>('', { alias: 'stCell' });
  constructor(public template: TemplateRef<unknown>) {}
}

@Directive({
  selector: '[agridataFlipRow]',
})
export class AgridataFlipRowDirective implements AfterViewInit, DoCheck {
  private readonly element = inject(ElementRef<HTMLElement>);
  readonly rowId = input<string>('');
  readonly totalRows = input<number>(0);

  private previousTop: number | null = null;
  private previousRowId: string | null = null;
  private previousTotalRows: number | null = null;
  private firstCheck = true;

  // Position threshold to ignore small movements (in pixels)
  private readonly POSITION_THRESHOLD = 2;

  // Track animation state to prevent overlapping animations
  private isAnimating = false;

  // Track if user is hovering to prevent animations during hover
  private isUserHover = false;

  // Last animation timestamp to debounce frequent animations
  private lastAnimationTime = 0;

  // Minimum time between animations (ms)
  private readonly ANIMATION_DEBOUNCE = 100;

  ngAfterViewInit() {
    this.setPrevState(this.element.nativeElement.getBoundingClientRect().top);

    // Add event listeners to track hover state
    this.element.nativeElement.addEventListener('mouseenter', () => {
      this.isUserHover = true;
    });

    this.element.nativeElement.addEventListener('mouseleave', () => {
      this.isUserHover = false;
    });
  }

  private setPrevState(top: number) {
    this.previousTop = top;
    this.previousRowId = this.rowId();
    this.previousTotalRows = this.totalRows();
    this.firstCheck = false;
  }

  ngDoCheck() {
    // Skip checks if currently animating or if user is hovering
    if (this.isAnimating || this.isUserHover) {
      return;
    }

    const element = this.element.nativeElement;
    const newTop = element.getBoundingClientRect().top;
    const now = Date.now();

    // FLIP animation for move (only if totalRows did not change to prevent unnecessary animations when filter changes)
    if (
      !this.firstCheck &&
      this.previousTop !== null &&
      this.previousRowId === this.rowId() &&
      this.previousTotalRows === this.totalRows() &&
      now - this.lastAnimationTime > this.ANIMATION_DEBOUNCE
    ) {
      const delta = this.previousTop - newTop;

      // Only trigger animation if the change exceeds our threshold
      if (Math.abs(delta) > this.POSITION_THRESHOLD) {
        this.isAnimating = true;
        this.lastAnimationTime = now;

        element.style.transition = 'none';
        element.style.transform = `translateY(${delta}px)`;

        requestAnimationFrame(() => {
          element.style.transition = 'transform 800ms cubic-bezier(.4,0,.2,1)';
          element.style.transform = '';

          // Listen for the end of transition to reset animation state
          const transitionEnd = () => {
            this.isAnimating = false;
            element.removeEventListener('transitionend', transitionEnd);
          };

          element.addEventListener('transitionend', transitionEnd);

          // Fallback in case transitionend doesn't fire
          setTimeout(() => {
            this.isAnimating = false;
          }, 850);
        });
      }
    }

    // Only update the previous state when we're not hovering
    if (!this.isUserHover) {
      this.setPrevState(newTop);
    }
  }
}
