import { CommonModule } from '@angular/common';
import { Component, computed, input } from '@angular/core';

import { Block, ImageCardBlock } from '@/entities/cms';
import { generateMediaUrl } from '@/shared/lib/cms';

import { CardBlockComponent } from '../card-block';

/**
 *  Component for rendering an image card block.
 *
 *  CommentLastReviewed: 2025-10-06
 */
@Component({
  selector: 'app-image-card-block',
  imports: [CommonModule, CardBlockComponent],
  templateUrl: './image-card-block.component.html',
})
export class ImageCardBlockComponent {
  readonly block = input.required<Block>();

  readonly generateMediaUrl = generateMediaUrl;

  protected readonly cmsData = computed(() => {
    return this.block() as ImageCardBlock;
  });

  protected readonly alternativeText = computed(() => {
    return this.cmsData().image.alternativeText;
  });
}
