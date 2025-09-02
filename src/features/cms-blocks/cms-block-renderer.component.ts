import { CommonModule } from '@angular/common';
import { Component, input } from '@angular/core';

import { Block } from '@/entities/cms';
import { CMS_BLOCKS } from '@/shared/constants/constants';
import {
  HeroBlockComponent,
  SectionCardGridBlockComponent,
  SectionMediaBlockComponent,
  SectionTextImageBlockComponent,
  SectionUserFeedbackBlockComponent,
} from '@/widgets/cms-blocks';

/**
 * Component for rendering CMS blocks dynamically. Selects the appropriate block component based on
 * type
 *
 * CommentLastReviewed: 2025-09-02
 */
@Component({
  selector: 'app-cms-block-renderer',
  standalone: true,
  imports: [
    CommonModule,
    HeroBlockComponent,
    SectionMediaBlockComponent,
    SectionTextImageBlockComponent,
    SectionUserFeedbackBlockComponent,
    SectionCardGridBlockComponent,
  ],
  templateUrl: './cms-block-renderer.component.html',
})
export class BlockRendererComponent {
  readonly block = input.required<Block>();
  readonly index = input.required<number>();

  protected readonly CMS_BLOCKS = CMS_BLOCKS;

  isOdd() {
    return this.index() % 2 === 1;
  }
}
