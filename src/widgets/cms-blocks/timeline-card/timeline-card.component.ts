import { Component, computed, input } from '@angular/core';

import { Block, resolveAlt, TimelineCardBlock } from '@/entities/cms';
import { generateMediaUrl } from '@/shared/lib/cms';

/**
 * Component for rendering a timeline card block.
 *
 * CommentLastReviewed: 2025-10-23
 */
@Component({
  selector: 'app-timeline-card',
  imports: [],
  templateUrl: './timeline-card.component.html',
})
export class TimelineCardComponent {
  readonly block = input.required<Block>();
  readonly lastItem = input<boolean>(false);
  readonly index = input<number>(0);

  readonly generateMediaUrl = generateMediaUrl;
  readonly resolveAlt = resolveAlt;

  protected readonly cmsData = computed(() => {
    return this.block() as TimelineCardBlock;
  });

  protected readonly isOdd = computed(() => {
    return this.index() % 2 === 1;
  });

  protected readonly alternativeText = computed(() => {
    const data = this.cmsData();
    return resolveAlt(data.imageAlt, data.image);
  });
}
