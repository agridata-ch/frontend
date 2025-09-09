import { Component, computed, inject } from '@angular/core';

import { CmsService, StrapiResponse } from '@/entities/cms';
import { BlockRendererComponent } from '@/features/cms-blocks';
import { HeroBlockComponent } from '@/widgets/cms-blocks';
import { CmsFooterBlockComponent } from '@/widgets/cms-blocks/cms-footer-block';

/**
 * Fetches content blocks from the CMS and renders them dynamically using the CMS block renderer
 * component.
 *
 * CommentLastReviewed: 2025-09-09
 */
@Component({
  selector: 'app-landing-page',
  imports: [BlockRendererComponent, HeroBlockComponent, CmsFooterBlockComponent],
  templateUrl: './landing-page.page.html',
})
export class LandingPage {
  private readonly strapiService = inject(CmsService);
  protected readonly cmsPage = this.strapiService.fetchLandingPage;

  protected readonly pageBlocks = computed(() => {
    const response = this.cmsPage.value() as StrapiResponse;
    return response.data.blocks;
  });

  protected readonly heroBlock = computed(() => {
    const response = this.cmsPage.value() as StrapiResponse;
    return response.data.hero;
  });

  protected readonly footerBlock = computed(() => {
    const response = this.cmsPage.value() as StrapiResponse;
    return response.data.footer;
  });
}
