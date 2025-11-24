import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, effect, inject, resource } from '@angular/core';
import { Router } from '@angular/router';
import { faSpinnerThird } from '@awesome.me/kit-0b6d1ed528/icons/duotone/solid';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';

import { ErrorHandlerService } from '@/app/error/error-handler.service';
import { TitleService } from '@/app/title.service';
import { CmsService, StrapiSingleTypeResponse } from '@/entities/cms';
import { BlockRendererComponent } from '@/features/cms-blocks';
import { ROUTE_PATHS } from '@/shared/constants/constants';
import { I18nService } from '@/shared/i18n';
import { createResourceValueComputed } from '@/shared/lib/api.helper';
import { SeoService } from '@/shared/seo/seo.service';
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
  imports: [BlockRendererComponent, HeroBlockComponent, CmsFooterBlockComponent, FaIconComponent],
  templateUrl: './landing-page.page.html',
})
export class LandingPage {
  private readonly strapiService = inject(CmsService);
  private readonly i18nService = inject(I18nService);
  private readonly router = inject(Router);
  private readonly errorService = inject(ErrorHandlerService);
  private readonly titleService = inject(TitleService);
  private readonly seoService = inject(SeoService);

  protected readonly landingPageResource = resource({
    params: () => ({ locale: this.i18nService.lang() }),
    loader: ({ params }) => {
      return this.strapiService.fetchLandingPage(params.locale);
    },
  });

  protected readonly landingPage = createResourceValueComputed(this.landingPageResource);

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

  protected readonly seoBlock = computed(() => {
    const response = this.landingPage() as StrapiSingleTypeResponse;
    return response.data.seo;
  });

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

  private readonly updatePageHtmlTitle = effect(() => {
    this.titleService.setTranslatedTitle(this.pageTitle());
  });

  private readonly updateSeoEffect = effect(() => {
    if (this.landingPageResource.isLoading()) return;
    const seo = this.seoBlock();
    if (seo) {
      this.seoService.updateSeo(seo);
    }
  });

  protected readonly pageTitle = computed(() => {
    const response = this.landingPage() as StrapiSingleTypeResponse;
    return response?.data?.seo?.metaTitle;
  });

  protected readonly faSpinnerThird = faSpinnerThird;
}
