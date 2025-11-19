import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, effect, inject, resource } from '@angular/core';
import { Router } from '@angular/router';

import { ErrorHandlerService } from '@/app/error/error-handler.service';
import { TitleService } from '@/app/title.service';
import {
  CmsService,
  StrapiSingleTypeResponse,
  StrapiSingleTypeResponseWithContent,
} from '@/entities/cms';
import { ROUTE_PATHS } from '@/shared/constants/constants';
import { I18nService } from '@/shared/i18n';
import { createResourceValueComputed } from '@/shared/lib/api.helper';
import { MarkdownPipe } from '@/shared/markdown/markdown.pipe';
import { CmsFooterBlockComponent } from '@/widgets/cms-blocks/cms-footer-block';

/**
 * Fetches imprint page from the CMS and renders the content using the Markdown pipe.
 *
 * CommentLastReviewed: 2025-10-16
 */
@Component({
  selector: 'app-imprint-page',
  imports: [CmsFooterBlockComponent, MarkdownPipe],
  templateUrl: './imprint-page.page.html',
})
export class ImprintPage {
  private readonly strapiService = inject(CmsService);
  private readonly i18nService = inject(I18nService);
  private readonly router = inject(Router);
  private readonly errorService = inject(ErrorHandlerService);
  private readonly titleService = inject(TitleService);

  protected readonly imprintPageResource = resource({
    params: () => ({ locale: this.i18nService.lang() }),
    loader: ({ params }) => {
      return this.strapiService.fetchImprintPage(params.locale);
    },
  });

  protected readonly imprintPage = createResourceValueComputed(this.imprintPageResource);

  protected readonly errorEffect = effect(() => {
    const error = this.imprintPageResource.error();
    if (error) {
      if (error?.cause instanceof HttpErrorResponse && error?.cause.status === 404) {
        this.router.navigate([ROUTE_PATHS.NOT_FOUND], { state: { error: error.message } });
      } else {
        this.errorService.handleError(error);
        this.router.navigate([ROUTE_PATHS.ERROR]);
      }
    }
  });

  protected readonly content = computed(() => {
    const response = this.imprintPage() as StrapiSingleTypeResponseWithContent;
    return response.data.content;
  });

  protected readonly footerBlock = computed(() => {
    const response = this.imprintPage() as StrapiSingleTypeResponseWithContent;
    return response.data.footer;
  });

  private readonly updatePageHtmlTitle = effect(() => {
    const response = this.imprintPageResource.value() as StrapiSingleTypeResponse;
    this.titleService.setTranslatedTitle(response?.data?.title);
  });
}
