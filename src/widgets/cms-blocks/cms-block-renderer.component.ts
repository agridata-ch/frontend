import { Component, input } from '@angular/core';

import { Block } from '@/entities/cms';
import { CMS_BLOCKS } from '@/shared/constants/constants';
import { DataCatalogBlockComponent } from '@/widgets/cms-blocks/data-catalog';
import { ImageGridBlockComponent } from '@/widgets/cms-blocks/image-grid-block/image-grid-block.component';
import { SectionCardGridBlockComponent } from '@/widgets/cms-blocks/section-card-grid-block/section-card-grid-block.component';
import { SectionContactFormBlockComponent } from '@/widgets/cms-blocks/section-contact-form-block/section-contact-form-block.component';
import { SectionFaqBlockComponent } from '@/widgets/cms-blocks/section-faq-block/section-faq-block.component';
import { SectionImageCardBlockComponent } from '@/widgets/cms-blocks/section-image-card-block/section-image-card-block.component';
import { SectionImageListComponent } from '@/widgets/cms-blocks/section-image-list/section-image-list.component';
import { SectionMediaBlockComponent } from '@/widgets/cms-blocks/section-media-block/section-media-block.component';
import { SectionOnboardingFormBlockComponent } from '@/widgets/cms-blocks/section-onboarding-form-block/section-onboarding-form-block.component';
import { SectionTextImageBlockComponent } from '@/widgets/cms-blocks/section-text-image-block/section-text-image-block.component';
import { SectionTimelineComponent } from '@/widgets/cms-blocks/section-timeline/section-timeline.component';
import { SectionUserFeedbackBlockComponent } from '@/widgets/cms-blocks/section-user-feedback-block/section-user-feedback-block.component';

/**
 * Component for rendering CMS blocks dynamically. Selects the appropriate block component based on
 * type
 *
 * CommentLastReviewed: 2025-09-09
 */
@Component({
  selector: 'app-cms-block-renderer',
  imports: [
    SectionMediaBlockComponent,
    SectionTextImageBlockComponent,
    SectionUserFeedbackBlockComponent,
    SectionCardGridBlockComponent,
    SectionContactFormBlockComponent,
    SectionOnboardingFormBlockComponent,
    SectionFaqBlockComponent,
    ImageGridBlockComponent,
    SectionImageCardBlockComponent,
    SectionImageListComponent,
    SectionTimelineComponent,
    DataCatalogBlockComponent,
  ],
  templateUrl: './cms-block-renderer.component.html',
})
export class BlockRendererComponent {
  readonly block = input.required<Block>();
  readonly index = input.required<number>();
  readonly isDynamicPage = input<boolean>(false);

  protected readonly CMS_BLOCKS = CMS_BLOCKS;

  isOdd() {
    // For dynamic pages, alternate starting with even index (0)
    return this.isDynamicPage() ? this.index() % 2 === 0 : this.index() % 2 === 1;
  }
}
