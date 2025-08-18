import { Component, computed, inject } from '@angular/core';

import { CmsService, StrapiResponse } from '@/entities/cms';
import { BlockRendererComponent } from '@/features/cms-blocks';

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
