import { Component, computed, input } from '@angular/core';

import { Block, SectionFaqBlock } from '@/entities/cms';
import { MarkdownPipe } from '@/shared/markdown';
import { ACCORDION_SKIN, AgridataAccordionComponent } from '@/widgets/agridata-accordion';

/**
 * Component for rendering a FAQ section block.
 *
 * CommentLastReviewed: 2025-09-22
 */
@Component({
  selector: 'app-section-faq-block',
  imports: [AgridataAccordionComponent, MarkdownPipe],
  templateUrl: './section-faq-block.component.html',
})
export class SectionFaqBlockComponent {
  // Constants
  protected readonly ACCORDION_SKIN = ACCORDION_SKIN;

  // Inputs
  readonly block = input.required<Block>();

  // Computed
  protected readonly cmsData = computed(() => {
    return this.block() as SectionFaqBlock;
  });
}
