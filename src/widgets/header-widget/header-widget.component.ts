import { Component, computed, inject, resource } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { filter, map } from 'rxjs';

import { ErrorHandlerService } from '@/app/error/error-handler.service';
import { CmsService, StrapiCollectionTypeResponse } from '@/entities/cms';
import { LanguageSelectComponent } from '@/features/language-select';
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

  readonly currentUrl = toSignal(
    this.router.events.pipe(
      filter((event) => event instanceof NavigationEnd),
      map(() => this.router.url),
    ),
    { initialValue: this.router.url },
  );

  readonly currentPage = computed(() => {
    const url = this.currentUrl();
    if (url?.startsWith('/cms/')) {
      return url.replace('/cms/', '');
    }
    return null;
  });

  readonly isAuthenticated = computed(() => this.authService.isAuthenticated());
  readonly userData = computed(() => this.authService.userData());

  readonly ButtonVariants = ButtonVariants;

  login = () => {
    this.authService.login();
  };
}
