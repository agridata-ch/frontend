import { Component, computed, inject } from '@angular/core';

import { CmsService, StrapiResponse } from '@/entities/cms';
import { BlockRendererComponent } from '@/features/cms-blocks';

/**
 * Fetches content blocks from the CMS and renders them dynamically using the CMS block renderer
 * component. It handles loading and error states gracefully.
 *
 * CommentLastReviewed: 2025-08-25
 */
@Component({
  selector: 'app-landing-page',
  imports: [BlockRendererComponent],
  templateUrl: './landing-page.page.html',
})
export class LandingPage {
  private readonly strapiService = inject(CmsService);
  protected readonly cmsPage = this.strapiService.fetchLandingPage;

  protected readonly pageBlocks = computed(() => {
    const response = this.cmsPage.value() as StrapiResponse;
    return response.data.blocks;
  });
}
