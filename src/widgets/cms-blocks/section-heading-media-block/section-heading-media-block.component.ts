import { Component, computed, input } from '@angular/core';

import { Block, SectionHeadingMediaBlock } from '@/entities/cms';
import { generateMediaUrl, isVideo } from '@/shared/lib/cms';

@Component({
  selector: 'app-section-heading-media-block',
  imports: [],
  templateUrl: './section-heading-media-block.component.html',
})
export class SectionHeadingMediaBlockComponent {
  readonly block = input.required<Block>();

  readonly generateMediaUrl = generateMediaUrl;
  readonly isVideo = isVideo;

  protected readonly cmsData = computed(() => {
    return this.block() as SectionHeadingMediaBlock;
  });
}
