import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, effect, inject, resource } from '@angular/core';
import { Router } from '@angular/router';
import { faSpinnerThird } from '@awesome.me/kit-0b6d1ed528/icons/duotone/solid';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';

import { ErrorHandlerService } from '@/app/error/error-handler.service';
import { TitleService } from '@/app/title.service';
import { AgbService } from '@/entities/api';
import {
  CmsService,
  StrapiSingleTypeResponse,
  StrapiSingleTypeResponseWithContent,
} from '@/entities/cms';
import { ROUTE_PATHS } from '@/shared/constants/constants';
import { formatDate } from '@/shared/date';
import { I18nService } from '@/shared/i18n';
import { createResourceValueComputed } from '@/shared/lib/api.helper';
import { CmsFooterBlockComponent } from '@/widgets/cms-blocks/cms-footer-block';

/**
 * Fetches the AGB (for contracts) page from the CMS and renders the content.
 * replace list styles similar to the MarkdownPipe
 *
 * CommentLastReviewed: 2026-08-20
 */
@Component({
  selector: 'app-agb-page',
  imports: [CmsFooterBlockComponent, FaIconComponent],
  templateUrl: './agb-page.page.html',
})
export class AgbPage {
  private readonly agbService = inject(AgbService);
  private readonly strapiService = inject(CmsService);
  private readonly i18nService = inject(I18nService);
  private readonly router = inject(Router);
  private readonly errorService = inject(ErrorHandlerService);
  private readonly titleService = inject(TitleService);

  protected readonly agbPageResource = resource({
    params: () => ({ locale: this.i18nService.lang() }),
    loader: async ({ params }) => {
      const [cmsPage, agbs] = await Promise.all([
        this.strapiService.fetchAgbPage(params.locale),
        this.agbService.fetchAgbs(),
      ]);
      return { cmsPage, agbs };
    },
  });

  protected readonly agbPage = createResourceValueComputed(this.agbPageResource);

  protected readonly content = computed(() => {
    const response = this.agbPage()?.agbs;
    if (!response) return '';

    const lang = this.i18nService.lang() as keyof typeof response.agbText;
    const html = response?.agbText?.[lang] ?? '';

    // replace ul and ol to add our custom classes to the HTML like we did in the "MarkdownPipe"
    return html
      .replaceAll('<ul>', '<ul class="list-disc pl-5">')
      .replaceAll('<ol>', '<ol class="list-decimal pl-5">');
  });

  protected readonly version = computed(() => {
    const response = this.agbPage()?.agbs;
    if (!response) return '';

    return this.i18nService.translate('agb.page.version', { version: response?.version });
  });

  protected readonly validFrom = computed(() => {
    const response = this.agbPage()?.agbs;
    if (!response) return '';

    return formatDate(response?.validFrom);
  });

  protected readonly footerBlock = computed(() => {
    const response = this.agbPage()?.cmsPage as StrapiSingleTypeResponseWithContent;
    return response.data.footer;
  });

  protected readonly errorEffect = effect(() => {
    const error = this.agbPageResource.error();
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
    const response = this.agbPageResource.value()?.cmsPage as StrapiSingleTypeResponse;
    this.titleService.setTranslatedTitle(response?.data?.title);
  });

  protected readonly faSpinnerThird = faSpinnerThird;
}
