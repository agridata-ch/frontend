import { Component, computed, input } from '@angular/core';

import { Block, ImageGridBlock } from '@/entities/cms';
import { generateMediaUrl } from '@/shared/lib/cms';

/**
 * Component for rendering an image grid block.
 *
 * CommentLastReviewed: 2025-09-22
 */
@Component({
  selector: 'app-image-grid-block',
  imports: [],
  templateUrl: './image-grid-block.component.html',
})
export class ImageGridBlockComponent {
  readonly block = input.required<Block>();

  readonly generateMediaUrl = generateMediaUrl;

  protected readonly cmsData = computed(() => {
    return this.block() as ImageGridBlock;
  });
}
