import { Component, computed, input } from '@angular/core';

import { Block, SectionMediaBlock } from '@/entities/cms';
import { generateMediaUrl, isVideo } from '@/shared/lib/cms';

/**
 * Implements rendering logic for handling both video and image media. It integrates helper
 * utilities for CMS-provided assets.
 *
 * CommentLastReviewed: 2025-09-02
 */
@Component({
  selector: 'app-section-media-block',
  imports: [],
  templateUrl: './section-media-block.component.html',
})
export class SectionMediaBlockComponent {
  readonly block = input.required<Block>();

  readonly generateMediaUrl = generateMediaUrl;
  readonly isVideo = isVideo;

  protected readonly cmsData = computed(() => {
    return this.block() as SectionMediaBlock;
  });
}
