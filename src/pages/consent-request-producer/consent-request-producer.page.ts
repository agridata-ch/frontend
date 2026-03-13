import { Component, computed, effect, inject, resource, signal, untracked } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { faFileCheck } from '@awesome.me/kit-0b6d1ed528/icons/classic/regular';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { filter, map, startWith } from 'rxjs';

import { ErrorHandlerService } from '@/app/error/error-handler.service';
import { ConsentRequestService } from '@/entities/api';
import { AgridataStateService } from '@/entities/api/agridata-state.service';
import { ConsentRequestProducerViewDto } from '@/entities/openapi';
import { ErrorOutletComponent } from '@/shared/error-alert-outlet/error-outlet.component';
import { I18nDirective, I18nPipe, I18nService } from '@/shared/i18n';
import {
  createResourceErrorHandlerEffect,
  createResourceValueComputed,
} from '@/shared/lib/api.helper';
import { ButtonComponent } from '@/shared/ui/button';
import { ModalComponent } from '@/shared/ui/modal/modal.component';
import { AlertComponent, AlertType } from '@/widgets/alert';
import { ConsentRequestTableComponent } from '@/widgets/consent-request-table';
import { ConsentRequestsTourIntroComponent } from '@/widgets/consent-requests-tour/consent-requests-tour-intro/consent-requests-tour-intro.component';

import { FORCE_RELOAD_CONSENT_REQUESTS_STATE_PARAM } from './consent-request-producer.page.model';

/**
 * Handles the display and interaction of consent requests for producers. It displays a table of
 * consent requests and provides a detail view for individual requests. It updates the selected
 * request based on route parameters, synchronizes state with the URL, and reloads data as needed.
 * it also handles the redirect to an external URL if specified in the route state and validated against
 * the request's valid redirect URI regex.
 *
 * CommentLastReviewed: 2026-03-09
 */
@Component({
  selector: 'app-consent-request-producer-page',
  imports: [
    ConsentRequestTableComponent,
    FontAwesomeModule,
    I18nDirective,
    I18nPipe,
    ErrorOutletComponent,
    AlertComponent,
    RouterOutlet,
    ModalComponent,
    ButtonComponent,
    ConsentRequestsTourIntroComponent,
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

  // :consentRequestId is a child route param (ConsentRequestDetailsComponent), not this
  // component's own route param, so input() never gets bound — read it from the child route because we use it to show the product-tour or not
  protected readonly consentRequestId = toSignal(
    this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd),
      startWith(null),
      map(
        () => this.activeRoute.firstChild?.snapshot.paramMap.get('consentRequestId') ?? undefined,
      ),
    ),
  );

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

  readonly showTourIntro = computed(() => {
    const userPreferences = this.agridataStateService.userPreferences();
    // don't show the tour intro if there is a consent request id in the route (so we don't interrupt the user when they are navigating directly to a specific request)
    // or if the user has already seen the tour intro or if there are no consent requests
    return (
      !this.consentRequestId() &&
      !userPreferences.hasSeenConsentRequestTourIntro &&
      this.consentRequestResource.value().length > 0
    );
  });

  closeTourIntro() {
    this.agridataStateService.saveTourIntroSeen(true);
  }

  readonly consentRequests = createResourceValueComputed(this.consentRequestResource, []);

  // Redirect-related signals
  private readonly redirectUrlFromQuery = signal<string | null>(null);
  protected readonly hasErrors = computed(() => this.errorService.getAllErrors()().length > 0);
  protected readonly hasRedirectUrl = computed(() => !!this.redirectUrlFromQuery());
  protected readonly showRedirect = computed(() => this.hasRedirectUrl() && this.hasErrors());
  protected readonly redirectUrl = computed(() => this.redirectUrlFromQuery());

  private readonly checkForRedirectEffect = effect(() => {
    const redirectUri = this.activeRoute.snapshot.queryParamMap.get('redirect_uri') ?? null;
    if (redirectUri) {
      this.redirectUrlFromQuery.set(redirectUri);
      // Use untracked read to avoid making the effect reactive to route changes
      const cleanUrl = untracked(() => this.agridataStateService.currentRouteWithoutQueryParams());
      // Replace the URL to remove the query parameter without reloading the page to prevent potential redirect loops
      globalThis.history.replaceState({}, '', cleanUrl);
    }
  });

  private readonly forceReloadConsentRequestsEffect = effect(() => {
    const nav = this.router.currentNavigation();
    if (nav?.extras?.state?.[FORCE_RELOAD_CONSENT_REQUESTS_STATE_PARAM]) {
      this.consentRequestResource.reload();
    }
  });

  private readonly handleFetchConsentRequestErrorsEffect = createResourceErrorHandlerEffect(
    this.consentRequestResource,
    this.errorService,
  );

  protected navigateToRequest = (request?: ConsentRequestProducerViewDto | null) => {
    if (request?.id) {
      this.router.navigate([request.id], { relativeTo: this.activeRoute }).then();
    }
  };

  closeMigrationInfo(requestId: string) {
    this.agridataStateService.addConfirmedMigratedUids([requestId]);
  }

  getMigratedRequestTitle(request: ConsentRequestProducerViewDto): string {
    return this.i18nService.useObjectTranslation(request?.dataRequest?.title);
  }

  protected readonly redirect = (): void => {
    const url = this.redirectUrl();
    if (url) {
      this.redirectUrlFromQuery.set(null);
      globalThis.location.href = url;
    }
  };
}
