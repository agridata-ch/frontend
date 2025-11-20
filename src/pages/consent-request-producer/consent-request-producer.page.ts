import { Component, computed, effect, inject, input, resource } from '@angular/core';
import { ActivatedRoute, Router, RouterOutlet } from '@angular/router';
import { faFileCheck } from '@awesome.me/kit-0b6d1ed528/icons/classic/regular';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

import { ErrorHandlerService } from '@/app/error/error-handler.service';
import { ConsentRequestService } from '@/entities/api';
import { AgridataStateService } from '@/entities/api/agridata-state.service';
import { ConsentRequestProducerViewDto } from '@/entities/openapi';
import { I18nDirective, I18nService } from '@/shared/i18n';
import {
  createResourceErrorHandlerEffect,
  createResourceValueComputed,
} from '@/shared/lib/api.helper';
import { ErrorOutletComponent } from '@/styles/error-alert-outlet/error-outlet.component';
import { AlertComponent, AlertType } from '@/widgets/alert';
import { ConsentRequestTableComponent } from '@/widgets/consent-request-table';

export const FORCE_RELOAD_CONSENT_REQUESTS_STATE_PARAM = 'refresh';

/**
 * Handles the display and interaction of consent requests for producers. It displays a table of
 * consent requests and provides a detail view for individual requests. It updates the selected
 * request based on route parameters, synchronizes state with the URL, and reloads data as needed.
 * it also handles the redirect to an external URL if specified in the route state and validated against
 * the request's valid redirect URI regex.
 *
 * CommentLastReviewed: 2025-10-08
 */
@Component({
  selector: 'app-consent-request-producer-page',
  imports: [
    ConsentRequestTableComponent,
    FontAwesomeModule,
    I18nDirective,
    ErrorOutletComponent,
    AlertComponent,
    RouterOutlet,
  ],
  templateUrl: './consent-request-producer.page.html',
})
export class ConsentRequestProducerPage {
  private readonly agridataStateService = inject(AgridataStateService);
  private readonly consentRequestService = inject(ConsentRequestService);
  private readonly router = inject(Router);
  private readonly errorService = inject(ErrorHandlerService);
  private readonly i18nService = inject(I18nService);
  private readonly activeRoute = inject(ActivatedRoute);
  // binds to the route parameter :consentRequestId
  readonly consentRequestId = input<string>();

  private readonly DISMISSED_MIGRATIONS_KEY = 'dismissedMigrationAlerts';
  readonly fileIcon = faFileCheck;
  readonly AlertType = AlertType;

  readonly consentRequestResource = resource({
    params: () => ({ uid: this.agridataStateService.activeUid() }),
    loader: ({ params }) => {
      if (!params?.uid) {
        return Promise.resolve([]);
      }
      return this.consentRequestService.fetchConsentRequests(params.uid);
    },
    defaultValue: [],
  });

  readonly locale = computed(() => this.i18nService.lang());

  private readonly dismissedMigrationIds = computed<Set<string>>(() => {
    const storedIds = this.agridataStateService.userPreferences().dismissedMigratedIds;
    return storedIds ? new Set(storedIds) : new Set();
  });

  readonly migratedRequests = computed(() =>
    this.consentRequestResource.value().filter((request) => request.showStateAsMigrated),
  );

  readonly visibleMigratedRequests = computed(() => {
    const dismissedIds = this.dismissedMigrationIds();
    return this.migratedRequests().filter((request) => !dismissedIds.has(request.id));
  });

  readonly consentRequests = createResourceValueComputed(this.consentRequestResource, []);
  private readonly handleFetchConsentRequestErrorsEffect = createResourceErrorHandlerEffect(
    this.consentRequestResource,
    this.errorService,
  );

  private readonly foreReloadConsentRequestsEffect = effect(() => {
    const nav = this.router.currentNavigation();
    if (nav?.extras?.state?.[FORCE_RELOAD_CONSENT_REQUESTS_STATE_PARAM]) {
      this.consentRequestResource.reload();
    }
  });

  protected navigateToRequest = (request?: ConsentRequestProducerViewDto | null) => {
    if (request?.id) {
      this.router.navigate([request.id], { relativeTo: this.activeRoute }).then();
    }
  };

  reloadConsentRequests = () => {
    this.consentRequestResource.reload();
  };

  closeMigrationInfo(requestId: string) {
    this.agridataStateService.addConfirmedMigratedUids([requestId]);
  }

  getMigratedRequestTitle(request: ConsentRequestProducerViewDto): string {
    return this.i18nService.useObjectTranslation(request?.dataRequest?.title);
  }
}
