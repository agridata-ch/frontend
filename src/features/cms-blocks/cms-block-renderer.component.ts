import { CommonModule } from '@angular/common';
import { Component, input } from '@angular/core';

import { Block } from '@/entities/cms';
import { CMS_BLOCKS } from '@/shared/constants/constants';
import {
  HeroBlockComponent,
  SectionHeadingMediaBlockComponent,
  SectionHeadingTextImageBlockComponent,
} from '@/widgets/cms-blocks';

/**
 * Component for rendering CMS blocks dynamically. Selects the appropriate block component based on
 * type and applies alternating layout logic for visual variation.
 *
 * CommentLastReviewed: 2025-08-25
 */
@Component({
  selector: 'app-cms-block-renderer',
  standalone: true,
  imports: [
    CommonModule,
    HeroBlockComponent,
    SectionHeadingMediaBlockComponent,
    SectionHeadingTextImageBlockComponent,
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
