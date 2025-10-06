import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, effect, inject, resource } from '@angular/core';
import { Router } from '@angular/router';

import { ErrorHandlerService } from '@/app/error/error-handler.service';
import { CmsService, StrapiSingleTypeResponse } from '@/entities/cms';
import { BlockRendererComponent } from '@/features/cms-blocks';
import { ROUTE_PATHS } from '@/shared/constants/constants';
import { I18nService } from '@/shared/i18n';
import { createResourceValueComputed } from '@/shared/lib/api.helper';
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
  private readonly i18nService = inject(I18nService);
  private readonly router = inject(Router);
  private readonly errorService = inject(ErrorHandlerService);

  protected readonly landingPageResource = resource({
    params: () => ({ locale: this.i18nService.lang() }),
    loader: ({ params }) => {
      return this.strapiService.fetchLandingPage(params.locale);
    },
  });

  protected readonly landingPage = createResourceValueComputed(this.landingPageResource);

  protected readonly errorEffect = effect(() => {
    const error = this.landingPageResource.error();
    if (error) {
      if (error?.cause instanceof HttpErrorResponse && error?.cause.status === 404) {
        this.router.navigate([ROUTE_PATHS.NOT_FOUND], { state: { error: error.message } });
      } else {
        this.errorService.handleError(error);
        this.router.navigate([ROUTE_PATHS.ERROR]);
      }
    }
  });

  protected readonly pageBlocks = computed(() => {
    const response = this.landingPage() as StrapiSingleTypeResponse;
    return response.data.blocks;
  });

  protected readonly heroBlock = computed(() => {
    const response = this.landingPage() as StrapiSingleTypeResponse;
    return response.data.hero;
  });

  protected readonly footerBlock = computed(() => {
    const response = this.landingPage() as StrapiSingleTypeResponse;
    return response.data.footer;
  });
}
