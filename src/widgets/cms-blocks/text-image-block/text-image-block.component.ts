import { Component, computed, input } from '@angular/core';

import { Block, TextImageBlock } from '@/entities/cms';
import { generateMediaUrl } from '@/shared/lib/cms';
import { ListBlockComponent } from '@/widgets/cms-blocks/list-block/list-block.component';

@Component({
  selector: 'app-text-image-block',
  imports: [ListBlockComponent],
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
