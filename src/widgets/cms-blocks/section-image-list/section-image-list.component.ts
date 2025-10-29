import { Component, computed, input } from '@angular/core';

import { Block, SectionImageListBlock } from '@/entities/cms';
import { generateMediaUrl } from '@/shared/lib/cms';
import { ImageListBlockComponent } from '@/widgets/cms-blocks/image-list-block/image-list-block.component';

/**
 * Implements the logic for displaying a list of images in a section.
 *
 * CommentLastReviewed: 2025-10-22
 */
@Component({
  selector: 'app-section-image-list',
  imports: [ImageListBlockComponent],
  templateUrl: './section-image-list.component.html',
})
export class SectionImageListComponent {
  readonly block = input.required<Block>();

  protected readonly cmsData = computed(() => {
    return this.block() as SectionImageListBlock;
  });
  protected readonly generateMediaUrl = generateMediaUrl;
}
