import { Component, computed, input } from '@angular/core';

import { Block, TextImageBlock } from '@/entities/cms';
import { generateMediaUrl } from '@/shared/lib/cms';
import { MarkdownPipe } from '@/shared/markdown/markdown.pipe';
import { ListBlockComponent } from '@/widgets/cms-blocks/list-block/list-block.component';

/**
 * Implements the logic for rendering text, heading, optional lists, and an image. It dynamically
 * reverses layout based on CMS data and integrates a markdown pipe for formatted text.
 *
 * CommentLastReviewed: 2025-08-25
 */
@Component({
  selector: 'app-text-image-block',
  imports: [ListBlockComponent, MarkdownPipe],
  templateUrl: './text-image-block.component.html',
})
export class TextImageBlockComponent {
  readonly block = input.required<Block>();

  readonly generateMediaUrl = generateMediaUrl;

  protected readonly cmsData = computed(() => {
    return this.block() as TextImageBlock;
  });

  protected readonly alternativeText = computed(() => {
    return this.cmsData().image.alternativeText;
  });
}
