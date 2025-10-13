import { Component, input } from '@angular/core';

/**
 * Implements the logic and rendering for the popover. It accepts inputs for open state and custom
 * CSS classes, enabling flexible positioning and styling. It uses Angular’s reactive inputs to
 * handle dynamic visibility and styling updates.
 *
 * CommentLastReviewed: 2025-08-25
 */
@Component({
  selector: 'app-popover',
  templateUrl: './popover.component.html',
})
export class PopoverComponent {
  readonly isOpen = input<boolean>(false);
  readonly class = input<string>('');
}
