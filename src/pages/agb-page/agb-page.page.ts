import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, effect, inject, resource } from '@angular/core';
import { Router } from '@angular/router';
import { faSpinnerThird } from '@awesome.me/kit-0b6d1ed528/icons/duotone/solid';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';

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
 * Fetches the AGB (for contracts) page from the CMS and renders the content using the Markdown pipe.
 *
 * CommentLastReviewed: 2026-04-02
 */
@Component({
  selector: 'app-agb-page',
  imports: [CmsFooterBlockComponent, MarkdownPipe, FaIconComponent],
  templateUrl: './agb-page.page.html',
})
export class AgbPage {
  private readonly strapiService = inject(CmsService);
  private readonly i18nService = inject(I18nService);
  private readonly router = inject(Router);
  private readonly errorService = inject(ErrorHandlerService);
  private readonly titleService = inject(TitleService);

  protected readonly agbPageResource = resource({
    params: () => ({ locale: this.i18nService.lang() }),
    loader: ({ params }) => {
      return this.strapiService.fetchAgbPage(params.locale);
    },
  });

  protected readonly agbPage = createResourceValueComputed(this.agbPageResource);

  protected readonly content = computed(() => {
    const response = this.agbPage() as StrapiSingleTypeResponseWithContent;
    return response.data.content;
  });

  protected readonly footerBlock = computed(() => {
    const response = this.agbPage() as StrapiSingleTypeResponseWithContent;
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
    const response = this.agbPageResource.value() as StrapiSingleTypeResponse;
    this.titleService.setTranslatedTitle(response?.data?.title);
  });

  protected readonly faSpinnerThird = faSpinnerThird;
}
