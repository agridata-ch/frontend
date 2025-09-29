import {
  AfterViewInit,
  Directive,
  DoCheck,
  ElementRef,
  OnDestroy,
  inject,
  input,
} from '@angular/core';

/**
 * Directive implementing FLIP animations for table rows. Detects row position changes during
 * reordering and applies smooth transitions to improve visual continuity without unnecessary animations.
 *
 * CommentLastReviewed: 2025-08-25
 */
@Directive({
  selector: '[agridataFlipRow]',
})
export class AgridataFlipRowDirective implements AfterViewInit, DoCheck, OnDestroy {
  private readonly element = inject(ElementRef<HTMLElement>);
  readonly rowId = input<string>('');
  readonly totalRows = input<number>(0);

  private previousTop: number | null = null;
  private previousRowId: string | null = null;
  private previousTotalRows: number | null = null;
  private firstCheck = true;

  private readonly POSITION_THRESHOLD = 2;

  private isAnimating = false;

  private isScrolling = false;
  private scrollTimeout: ReturnType<typeof setTimeout> | null = null;

  private lastAnimationTime = 0;

  private readonly ANIMATION_DEBOUNCE = 100;

  private scrollListener: (() => void) | null = null;

  ngAfterViewInit() {
    this.setPrevState(this.element.nativeElement.getBoundingClientRect().top);

    this.scrollListener = () => {
      this.isScrolling = true;

      if (this.scrollTimeout !== null) {
        clearTimeout(this.scrollTimeout);
      }

      this.scrollTimeout = setTimeout(() => {
        this.isScrolling = false;
        this.setPrevState(this.element.nativeElement.getBoundingClientRect().top);
      }, 150);
    };

    window.addEventListener('scroll', this.scrollListener, { passive: true });
  }

  ngOnDestroy() {
    if (this.scrollListener) {
      window.removeEventListener('scroll', this.scrollListener);
    }

    if (this.scrollTimeout !== null) {
      clearTimeout(this.scrollTimeout);
    }
  }

  private setPrevState(top: number) {
    this.previousTop = top;
    this.previousRowId = this.rowId();
    this.previousTotalRows = this.totalRows();
    this.firstCheck = false;
  }

  ngDoCheck() {
    if (this.isAnimating || this.isScrolling) {
      return;
    }

    const element = this.element.nativeElement;
    const newTop = element.getBoundingClientRect().top;
    const now = Date.now();

    // FLIP animation for move (only if totalRows did not change to prevent unnecessary animations when filter changes)
    if (
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

    if (!this.isScrolling) {
      this.setPrevState(newTop);
    }
  }
}
