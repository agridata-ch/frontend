import { Component, computed, inject, resource } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

import { ErrorHandlerService } from '@/app/error/error-handler.service';
import { AgridataStateService } from '@/entities/api/agridata-state.service';
import { CmsService, StrapiCollectionTypeResponse } from '@/entities/cms';
import { environment } from '@/environments/environment';
import { LanguageSelectComponent } from '@/features/language-select';
import { ROUTE_PATHS } from '@/shared/constants/constants';
import { I18nPipe, I18nService } from '@/shared/i18n';
import { createResourceErrorHandlerEffect } from '@/shared/lib/api.helper';
import { AuthService } from '@/shared/lib/auth';
import { ButtonComponent, ButtonVariants } from '@/shared/ui/button';
import { AccountOverlayComponent } from '@/widgets/account-overlay';
import { ContactSupportInfoComponent } from '@/widgets/contact-support-info';
import { NavigationWidgetComponent } from '@/widgets/navigation-widget';

/**
 * Implements the header logic. It renders the application logo, includes language selection, and
 * conditionally shows the account overlay or login button depending on authentication state. It
 * integrates authentication services and ensures reactive updates when user data changes.
 *
 * CommentLastReviewed: 2025-10-09
 */
@Component({
  selector: 'app-header-widget',
  imports: [
    RouterLink,
    LanguageSelectComponent,
    I18nPipe,
    AccountOverlayComponent,
    NavigationWidgetComponent,
    ButtonComponent,
    ContactSupportInfoComponent,
  ],
  templateUrl: './header-widget.component.html',
  styleUrl: './header-widget.component.css',
})
export class HeaderWidgetComponent {
  private readonly authService = inject(AuthService);
  private readonly strapiService = inject(CmsService);
  private readonly i18nService = inject(I18nService);
  private readonly router = inject(Router);
  private readonly errorHandler = inject(ErrorHandlerService);
  private readonly stateService = inject(AgridataStateService);

  protected readonly cmsPagesResource = resource({
    params: () => ({
      isAuthenticated: this.authService.isAuthenticated(),
      locale: this.i18nService.lang(),
    }),
    loader: ({ params }) => {
      if (!params.isAuthenticated) {
        return this.strapiService.fetchCmsPages(params.locale);
      }
      return Promise.resolve(null);
    },
  });

  handleCmsPageResourceErrors = createResourceErrorHandlerEffect(
    this.cmsPagesResource,
    this.errorHandler,
  );

  readonly cmsPages = computed(() => {
    if (!this.cmsPagesResource.error()) {
      const data = (this.cmsPagesResource.value() as StrapiCollectionTypeResponse)?.data;
      return data ? [...data].sort((a, b) => (a.position > b.position ? 1 : -1)) : [];
    }
    return [];
  });

  readonly currentCmsPageSlug = computed(() => {
    const url = this.stateService.currentRoute();
    if (url?.startsWith('/cms/')) {
      return url.replace('/cms/', '');
    }
    return null;
  });

  readonly isAuthenticated = computed(() => this.authService.isAuthenticated());

  readonly environment = computed(() => (environment.production ? null : environment.instanceName));
  readonly envColor = computed(() => {
    switch (environment?.instanceName) {
      case 'local':
        return 'border-t-green-500 ';
      case 'DEV':
        return 'border-t-orange-400 ';
      case 'INT':
        return 'border-t-blue-600';
      default:
        return 'border-t-green-500';
    }
  });

  readonly userInfo = this.authService.userInfo;
  readonly ButtonVariants = ButtonVariants;

  login = () => {
    this.router.navigate([ROUTE_PATHS.LOGIN]).then();
  };
}
