import { Directive, HostListener } from '@angular/core';

/**
 * Prevents a click event from propagating to parent elements and cancels the default browser
 * action (e.g. following an ancestor <a> href). Both are required: stopPropagation blocks Angular
 * RouterLink from navigating, preventDefault prevents the browser from following the href natively
 * when RouterLink never fires.
 *
 * CommentLastReviewed: 2026-06-02
 */
@Directive({
  selector: '[click-stop-propagation]',
})
export class ClickStopPropagationDirective {
  @HostListener('click', ['$event'])
  public onClick(event: Event): void {
    event.stopPropagation();
    event.preventDefault();
  }
}
