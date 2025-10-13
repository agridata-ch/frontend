import { Component, computed, input } from '@angular/core';

import { Block, SectionCardGridBlock } from '@/entities/cms';
import { CardBlockComponent } from '@/widgets/cms-blocks/card-block';

/**
 * Implements the logic for displaying a grid of cards.
 *
 * CommentLastReviewed: 2025-09-02
 */
@Component({
  selector: 'app-section-card-grid-block',
  imports: [CardBlockComponent],
  templateUrl: './section-card-grid-block.component.html',
})
export class SectionCardGridBlockComponent {
  readonly block = input.required<Block>();

  protected readonly cmsData = computed(() => {
    return this.block() as SectionCardGridBlock;
  });
}
