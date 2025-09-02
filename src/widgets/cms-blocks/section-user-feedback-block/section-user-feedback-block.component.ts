import { Component, computed, input } from '@angular/core';

import { Block, SectionUserFeedbackBlock } from '@/entities/cms';

import { UserFeedbackBlockComponent } from '../user-feedback-block/user-feedback-block.component';

/**
 * Implements the logic for displaying a section that includes user feedback blocks.
 *
 * CommentLastReviewed: 2025-09-02
 */
@Component({
  selector: 'app-section-user-feedback-block',
  imports: [UserFeedbackBlockComponent],
  templateUrl: './section-user-feedback-block.component.html',
})
export class SectionUserFeedbackBlockComponent {
  readonly block = input.required<Block>();

  protected readonly cmsData = computed(() => {
    return this.block() as SectionUserFeedbackBlock;
  });
}
