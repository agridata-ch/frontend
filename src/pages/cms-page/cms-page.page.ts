import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, effect, inject, input, resource } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { faArrowRight } from '@awesome.me/kit-0b6d1ed528/icons/classic/regular';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

import { ErrorHandlerService } from '@/app/error/error-handler.service';
import { TitleService } from '@/app/title.service';
import { CmsService, StrapiSingleTypeResponse } from '@/entities/cms';
import { BlockRendererComponent } from '@/features/cms-blocks';
import { ROUTE_PATHS } from '@/shared/constants/constants';
import { I18nPipe, I18nService } from '@/shared/i18n';
import { SeoService } from '@/shared/seo/seo.service';
import { HeroBlockComponent } from '@/widgets/cms-blocks';
import { CmsFooterBlockComponent } from '@/widgets/cms-blocks/cms-footer-block';

/**
 * Fetches content blocks from the CMS and renders them dynamically using the CMS block renderer
 * component.
 *
 * CommentLastReviewed: 2025-10-09
 */
@Component({
  selector: 'app-cms-page',
  imports: [
    RouterLink,
    BlockRendererComponent,
    HeroBlockComponent,
    CmsFooterBlockComponent,
    I18nPipe,
    FontAwesomeModule,
  ],
  templateUrl: './cms-page.page.html',
})
export class CmsPage {
  private readonly strapiService = inject(CmsService);
  private readonly i18nService = inject(I18nService);
  private readonly router = inject(Router);
  private readonly errorService = inject(ErrorHandlerService);
  protected readonly breadcrumbIcon = faArrowRight;
  private readonly titleService = inject(TitleService);
  private readonly seoService = inject(SeoService);

  // binds to the route parameter :slug
  readonly slug = input<string>('');

  protected readonly cmsPageResource = resource({
    params: () => ({ locale: this.i18nService.lang(), slug: this.slug() }),
    loader: ({ params }) => {
      return this.strapiService.fetchCmsPage(this.slug(), params.locale);
    },
  });

  protected readonly pageTitle = computed(() => {
    const response = this.cmsPageResource.value() as StrapiSingleTypeResponse;
    return response?.data?.title;
  });

  protected readonly pageBlocks = computed(() => {
    const response = this.cmsPageResource.value() as StrapiSingleTypeResponse;
    return response.data.blocks;
  });

  protected readonly heroBlock = computed(() => {
    const response = this.cmsPageResource.value() as StrapiSingleTypeResponse;
    return response.data.hero;
  });

  protected readonly footerBlock = computed(() => {
    const response = this.cmsPageResource.value() as StrapiSingleTypeResponse;
    return response.data.footer;
  });

  protected readonly seoBlock = computed(() => {
    const response = this.cmsPageResource.value() as StrapiSingleTypeResponse;
    return response.data.seo;
  });

  protected readonly errorEffect = effect(() => {
    const error = this.cmsPageResource.error();
    if (error) {
      if (error?.cause instanceof HttpErrorResponse && error?.cause.status === 404) {
        this.router.navigate([ROUTE_PATHS.NOT_FOUND], { state: { error: error.message } }).then();
      } else {
        this.errorService.handleError(error);
        this.router.navigate([ROUTE_PATHS.ERROR]).then();
      }
    }
  });

  private readonly updatePageHtmlTitle = effect(() => {
    this.titleService.setTranslatedTitle(this.pageTitle());
  });

  private readonly updateSeoEffect = effect(() => {
    if (this.cmsPageResource.isLoading()) return;
    const seo = this.seoBlock();
    this.seoService.updateSeo(seo);
  });
}
