import { Component, computed, input } from '@angular/core';

import { Block, SectionTimelineBlock } from '@/entities/cms';

import { TimelineCardComponent } from '../timeline-card/timeline-card.component';

/**
 * Component for rendering a timeline section block.
 *
 * CommentLastReviewed: 2025-10-23
 */
@Component({
  selector: 'app-section-timeline',
  imports: [TimelineCardComponent],
  templateUrl: './section-timeline.component.html',
})
export class SectionTimelineComponent {
  readonly block = input.required<Block>();

  protected readonly cmsData = computed(() => {
    return this.block() as SectionTimelineBlock;
  });
}
