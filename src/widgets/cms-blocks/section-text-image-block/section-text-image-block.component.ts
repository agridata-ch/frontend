import { Component, computed, input } from '@angular/core';

import { Block, SectionTextImageBlock } from '@/entities/cms';
import { TextImageBlockComponent } from '@/widgets/cms-blocks/text-image-block/text-image-block.component';

/**
 * Implements logic to render a section heading and iterate through nested text–image blocks.
 *
 * CommentLastReviewed: 2025-09-02
 */
@Component({
  selector: 'app-section-text-image-block',
  imports: [TextImageBlockComponent],
  templateUrl: './section-text-image-block.component.html',
})
export class SectionTextImageBlockComponent {
  readonly block = input.required<Block>();

  protected readonly cmsData = computed(() => {
    return this.block() as SectionTextImageBlock;
  });
}
