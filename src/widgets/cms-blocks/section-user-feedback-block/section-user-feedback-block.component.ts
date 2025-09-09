import { Component, computed, input } from '@angular/core';

import { Block, SectionUserFeedbackBlock } from '@/entities/cms';
import { UserFeedbackBlockComponent } from '@/widgets/cms-blocks/user-feedback-block';
import { SliderComponent } from '@/widgets/slider';

/**
 * Implements the logic for displaying a section that includes user feedback blocks.
 *
 * CommentLastReviewed: 2025-09-02
 */
@Component({
  selector: 'app-section-user-feedback-block',
  imports: [UserFeedbackBlockComponent, SliderComponent],
  templateUrl: './section-user-feedback-block.component.html',
})
export class SectionUserFeedbackBlockComponent {
  readonly block = input.required<Block>();

  protected readonly cmsData = computed(() => {
    return this.block() as SectionUserFeedbackBlock;
  });
}
