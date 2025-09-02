import { Component, input } from '@angular/core';

import { UserFeedbackBlock } from '@/entities/cms';
import { generateMediaUrl } from '@/shared/lib/cms';

/**
 * Implements the logic for displaying a user feedback block.
 *
 * CommentLastReviewed: 2025-09-02
 */
@Component({
  selector: 'app-user-feedback-block',
  imports: [],
  templateUrl: './user-feedback-block.component.html',
})
export class UserFeedbackBlockComponent {
  readonly block = input.required<UserFeedbackBlock>();

  protected readonly generateMediaUrl = generateMediaUrl;
}
