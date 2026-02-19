import { Component, HostBinding, input } from '@angular/core';

/**
 * A simple component to display an empty state message or graphic
 * when there is no data to show in a table or list.
 *
 * CommentLastReviewed: 2026-01-27
 **/
@Component({
  selector: 'app-empty-state',
  imports: [],
  templateUrl: './empty-state.component.html',
})
export class EmptyStateComponent {
  @HostBinding('style.display') display = 'contents';

  readonly title = input<string>();
  readonly message = input<string>();
  readonly additionalInfo = input<string>();
  readonly action = input<() => void>();
}
