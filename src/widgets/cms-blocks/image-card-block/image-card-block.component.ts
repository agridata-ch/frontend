import { Component, computed, input } from '@angular/core';

import { Block, ImageCardBlock, resolveAlt } from '@/entities/cms';
import { generateMediaUrl } from '@/shared/lib/cms';

import { CardBlockComponent } from '../card-block';

/**
 *  Component for rendering an image card block.
 *
 *  CommentLastReviewed: 2025-10-06
 */
@Component({
  selector: 'app-image-card-block',
  imports: [CardBlockComponent],
  templateUrl: './image-card-block.component.html',
})
export class ImageCardBlockComponent {
  readonly block = input.required<Block>();

  readonly generateMediaUrl = generateMediaUrl;

  protected readonly cmsData = computed(() => {
    return this.block() as ImageCardBlock;
  });

  protected readonly alternativeText = computed(() => {
    const data = this.cmsData();
    return resolveAlt(data.imageAlt, data.image);
  });
}
