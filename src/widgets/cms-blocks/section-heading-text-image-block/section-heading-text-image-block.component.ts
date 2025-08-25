import { Component, computed, input } from '@angular/core';

import { Block, SectionHeadingTextImageBlock } from '@/entities/cms';
import { TextImageBlockComponent } from '@/widgets/cms-blocks/text-image-block/text-image-block.component';

/**
 * Implements logic to render a section heading and iterate through nested text–image blocks.
 *
 * CommentLastReviewed: 2025-08-25
 */
@Component({
  selector: 'app-section-heading-text-image-block',
  imports: [TextImageBlockComponent],
  templateUrl: './section-heading-text-image-block.component.html',
})
export class SectionHeadingTextImageBlockComponent {
  readonly block = input.required<Block>();

  protected readonly cmsData = computed(() => {
    return this.block() as SectionHeadingTextImageBlock;
  });
}
