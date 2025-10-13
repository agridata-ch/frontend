import { Component, computed, input } from '@angular/core';

import { Block, SectionImageCardBlock } from '@/entities/cms';
import { ImageCardBlockComponent } from '@/widgets/cms-blocks/image-card-block/image-card-block.component';

/**
 * Component for rendering a section image card block.
 *
 * CommentLastReviewed: 2025-10-06
 */
@Component({
  selector: 'app-section-image-card-block',
  imports: [ImageCardBlockComponent],
  templateUrl: './section-image-card-block.component.html',
})
export class SectionImageCardBlockComponent {
  readonly block = input.required<Block>();

  protected readonly cmsData = computed(() => {
    return this.block() as SectionImageCardBlock;
  });
}
