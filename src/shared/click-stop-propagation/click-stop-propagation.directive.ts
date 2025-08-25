import { Directive, HostListener } from '@angular/core';

/**
 * Implements the directive logic. It listens for click events on the host element and calls
 * stopPropagation() to prevent parent elements from receiving the event.
 *
 * CommentLastReviewed: 2025-08-25
 */
@Directive({
  selector: '[click-stop-propagation]',
})
export class ClickStopPropagationDirective {
  @HostListener('click', ['$event'])
  public onClick(event: Event): void {
    event.stopPropagation();
  }
}
