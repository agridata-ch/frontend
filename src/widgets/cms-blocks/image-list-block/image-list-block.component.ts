import { Component, computed, input } from '@angular/core';

import { Block, ImageListBlock } from '@/entities/cms';
import { generateMediaUrl } from '@/shared/lib/cms';

/**
 * Implements the logic for displaying the image list cms block.
 *
 * CommentLastReviewed: 2025-10-22
 */
@Component({
  selector: 'app-image-list-block',
  imports: [],
  templateUrl: './image-list-block.component.html',
})
export class ImageListBlockComponent {
  readonly block = input.required<Block>();

  readonly generateMediaUrl = generateMediaUrl;

  protected readonly cmsData = computed(() => {
    return this.block() as ImageListBlock;
  });
}
