import { Location } from '@angular/common';
import { Component, computed, effect, inject, input, resource, signal } from '@angular/core';
import { Router } from '@angular/router';
import { faFileCheck } from '@awesome.me/kit-0b6d1ed528/icons/classic/regular';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

import { ErrorHandlerService } from '@/app/error/error-handler.service';
import { ConsentRequestService } from '@/entities/api';
import { AgridataStateService } from '@/entities/api/agridata-state.service';
import { ConsentRequestProducerViewDto } from '@/entities/openapi';
import { ROUTE_PATHS } from '@/shared/constants/constants';
import { I18nDirective, I18nPipe, I18nService } from '@/shared/i18n';
import {
  createResourceErrorHandlerEffect,
  createResourceValueComputed,
} from '@/shared/lib/api.helper';
import { ButtonComponent } from '@/shared/ui/button';
import { ModalComponent } from '@/shared/ui/modal/modal.component';
import { ErrorOutletComponent } from '@/styles/error-alert-outlet/error-outlet.component';
import { AlertComponent, AlertType } from '@/widgets/alert';
import { ConsentRequestDetailsComponent } from '@/widgets/consent-request-details';
import { ConsentRequestTableComponent } from '@/widgets/consent-request-table';

import { REDIRECT_TIMEOUT } from './consent-request-producer.page.model';

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
    ConsentRequestDetailsComponent,
    I18nDirective,
    ButtonComponent,
    ModalComponent,
    ErrorOutletComponent,
    I18nPipe,
    AlertComponent,
  ],
  templateUrl: './consent-request-producer.page.html',
})
export class ConsentRequestProducerPage {
  private readonly agridataStateService = inject(AgridataStateService);
  private readonly consentRequestService = inject(ConsentRequestService);
  private readonly router = inject(Router);
  private readonly location = inject(Location);
  private readonly errorService = inject(ErrorHandlerService);
  private readonly i18nService = inject(I18nService);
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

  readonly selectedRequest = signal<ConsentRequestProducerViewDto | null>(null);
  readonly redirectUrl = signal<string | null>(null);
  readonly showRedirect = signal<boolean>(false);
  readonly countdownValue = signal(REDIRECT_TIMEOUT / 1000);
  readonly shouldRedirect = signal<boolean>(false);
  private readonly dismissedMigrationIds = signal<Set<string>>(this.loadDismissedMigrationIds());

  readonly locale = computed(() => this.i18nService.lang());

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

  // Store timers at class level so they can be accessed and cleared from anywhere
  private countdownTimer?: ReturnType<typeof setInterval>;
  private redirectTimeout?: ReturnType<typeof setTimeout>;

  readonly handleRouterState = effect((onCleanup) => {
    // Clean up any existing timers first
    this.clearAllTimers();

    const state = history.state;

    if (state?.justCreated && state?.consentRequestId) {
      this.consentRequestResource.reload();
      globalThis.history.replaceState(
        { ...(state.redirect_uri && { redirect_uri: state.redirect_uri }) },
        '',
        globalThis.location.href,
      );
    }

    if (state?.redirect_uri) {
      this.redirectUrl.set(state.redirect_uri);
    }

    if (state?.shouldRedirect) {
      this.showRedirect.set(true);

      // Clean up state to prevent persistence when returning to the page
      // by replacing current history entry with a clean one
      globalThis.history.replaceState({}, '', globalThis.location.href);

      if (state.redirectUrl) {
        this.redirectUrl.set(state.redirectUrl);
        this.startCountdown();

        this.redirectTimeout = setTimeout(() => {
          // Store the URL before cleaning up
          const url = state.redirectUrl!;
          // Clean up timers before redirecting
          this.clearAllTimers();
          this.resetRedirect();
          globalThis.location.href = url;
        }, REDIRECT_TIMEOUT);

        // Register cleanup function with effect
        onCleanup(() => {
          this.clearAllTimers();
          this.resetRedirect();
        });
      }
    }
  });

  readonly updateOpenedRequest = effect(() => {
    const id = this.consentRequestId();

    if (!id) {
      this.selectedRequest.set(null);
      return;
    }

    if (!id || this.consentRequestResource.isLoading()) return;

    const request = this.consentRequests().find((r) => r.id === id) ?? null;

    this.selectedRequest.set(request);
    this.checkForRedirect();
  });

  checkForRedirect() {
    if (this.redirectUrl()) {
      const redirectUrlPattern = this.selectedRequest()?.dataRequest?.validRedirectUriRegex;

      if (!redirectUrlPattern) {
        this.resetRedirect();
        return;
      }

      try {
        // we can ignore the lint warning here as we trust the pattern from our own backend
        /* eslint-disable-next-line security/detect-non-literal-regexp */
        const redirectRegex = new RegExp(redirectUrlPattern);

        if (!redirectRegex?.test(this.redirectUrl() || '')) {
          this.resetRedirect();
          return;
        }

        this.shouldRedirect.set(true);
      } catch (error) {
        console.warn(
          `Invalid regex pattern provided: '${redirectUrlPattern}', error: ${error instanceof Error ? error.message : error}`,
        );
        this.resetRedirect();
        return;
      }
    }
  }

  resetRedirect = () => {
    this.redirectUrl.set(null);
    this.shouldRedirect.set(false);
    this.showRedirect.set(false);
  };

  setSelectedRequest = (request?: ConsentRequestProducerViewDto | null) => {
    this.selectedRequest.set(request ?? null);

    const base =
      ROUTE_PATHS.CONSENT_REQUEST_PRODUCER_PATH + `/${this.agridataStateService.activeUid()}`;

    // use location.go if a request is selected to trigger animation correctly.
    // use router.navigate if no request is selected to also update the URL and router
    // location.go does not update the router state so the effect is not triggering again without a consentRequestId param set
    if (request?.id) {
      this.location.go(`${base}/${request.id}`);
    } else {
      this.router.navigate([base], {
        replaceUrl: true,
        state: { shouldRedirect: this.shouldRedirect(), redirectUrl: this.redirectUrl() },
      });
    }
  };

  reloadConsentRequests = () => {
    this.consentRequestResource.reload();
  };

  startCountdown(): void {
    // Clear any existing countdown timer first
    if (this.countdownTimer) {
      clearInterval(this.countdownTimer);
    }

    this.countdownValue.set(REDIRECT_TIMEOUT / 1000);
    this.countdownTimer = setInterval(() => {
      const currentValue = this.countdownValue();
      if (currentValue <= 1) {
        if (this.countdownTimer) {
          clearInterval(this.countdownTimer);
          this.countdownTimer = undefined;
        }
      } else {
        this.countdownValue.set(currentValue - 1);
      }
    }, 1000);
  }

  redirectDirectly = () => {
    const url = this.redirectUrl();
    if (url) {
      // Make sure to clear timers before redirecting
      this.clearAllTimers();
      this.resetRedirect();
      globalThis.location.href = url;
    }
  };

  closeMigrationInfo(requestId: string) {
    const currentIds = this.dismissedMigrationIds();
    const updatedIds = new Set(currentIds);
    updatedIds.add(requestId);
    this.dismissedMigrationIds.set(updatedIds);
    this.saveDismissedMigrationIds(updatedIds);
  }

  getMigratedRequestTitle(request: ConsentRequestProducerViewDto): string {
    return this.i18nService.useObjectTranslation(request?.dataRequest?.title);
  }

  // Method to clear all timers in one place
  private clearAllTimers() {
    if (this.countdownTimer) {
      clearInterval(this.countdownTimer);
      this.countdownTimer = undefined;
    }
    if (this.redirectTimeout) {
      clearTimeout(this.redirectTimeout);
      this.redirectTimeout = undefined;
    }
  }

  private loadDismissedMigrationIds(): Set<string> {
    const storedIds = localStorage.getItem(this.DISMISSED_MIGRATIONS_KEY);
    return storedIds ? new Set(JSON.parse(storedIds)) : new Set();
  }

  private saveDismissedMigrationIds(ids: Set<string>): void {
    localStorage.setItem(this.DISMISSED_MIGRATIONS_KEY, JSON.stringify([...ids]));
  }
}
