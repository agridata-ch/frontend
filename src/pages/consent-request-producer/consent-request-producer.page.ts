import { Location } from '@angular/common';
import { Component, effect, inject, input, resource, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faFile } from '@fortawesome/free-regular-svg-icons';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';

import { ConsentRequestService } from '@/entities/api';
import { AgridataStateService } from '@/entities/api/agridata-state.service';
import { ConsentRequestProducerViewDto } from '@/entities/openapi';
import { ROUTE_PATHS } from '@/shared/constants/constants';
import { I18nDirective } from '@/shared/i18n';
import { ButtonComponent } from '@/shared/ui/button';
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
  ],
  templateUrl: './consent-request-producer.page.html',
})
export class ConsentRequestProducerPage {
  private readonly agridataStateService = inject(AgridataStateService);
  private readonly consentRequestService = inject(ConsentRequestService);
  private readonly router = inject(Router);
  private readonly location = inject(Location);

  // binds to the route parameter :consentRequestId
  readonly consentRequestId = input<string>();
  readonly fileIcon = faFile;
  readonly faSpinner = faSpinner;

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

  readonly consentRequests = this.consentRequestResource;

  readonly selectedRequest = signal<ConsentRequestProducerViewDto | null>(null);
  readonly redirectUrl = signal<string | null>(null);
  readonly showRedirect = signal<boolean>(false);
  readonly countdownValue = signal(REDIRECT_TIMEOUT / 1000);
  readonly shouldRedirect = signal<boolean>(false);

  // Store timers at class level so they can be accessed and cleared from anywhere
  private countdownTimer?: ReturnType<typeof setInterval>;
  private redirectTimeout?: ReturnType<typeof setTimeout>;

  readonly handleRouterState = effect((onCleanup) => {
    // Clean up any existing timers first
    this.clearAllTimers();

    const state = history.state;

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

    if (!id || this.consentRequests.isLoading()) return;

    const request = this.consentRequests.value().find((r) => r.id === id) ?? null;

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
    this.consentRequests.reload();
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
}
