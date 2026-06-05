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
import { CmsFooterBlockComponent } from '@/widgets/cms-blocks/cms-footer-block';

/**
 * Fetches the onboarding page from the CMS and renders its blocks dynamically.
 *
 * CommentLastReviewed: 2026-06-04
 */
@Component({
  selector: 'app-onboarding-page',
  imports: [BlockRendererComponent, CmsFooterBlockComponent, FaIconComponent],
  templateUrl: './onboarding-page.page.html',
})
export class OnboardingPage {
  private readonly strapiService = inject(CmsService);
  private readonly i18nService = inject(I18nService);
  private readonly router = inject(Router);
  private readonly errorService = inject(ErrorHandlerService);
  private readonly titleService = inject(TitleService);

  protected readonly onboardingPageResource = resource({
    params: () => ({ locale: this.i18nService.lang() }),
    loader: ({ params }) => {
      return this.strapiService.fetchOnboardingPage(params.locale);
    },
  });

  protected readonly onboardingPage = createResourceValueComputed(this.onboardingPageResource);

  protected readonly pageBlocks = computed(() => {
    const response = this.onboardingPage() as StrapiSingleTypeResponse;
    return response.data.blocks;
  });

  protected readonly footerBlock = computed(() => {
    const response = this.onboardingPage() as StrapiSingleTypeResponse;
    return response.data.footer;
  });

  protected readonly errorEffect = effect(() => {
    const error = this.onboardingPageResource.error();
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
    const response = this.onboardingPageResource.value() as StrapiSingleTypeResponse;
    this.titleService.setTranslatedTitle(response?.data?.title);
  });

  protected readonly faSpinnerThird = faSpinnerThird;
}
