import {
  Component,
  computed,
  DOCUMENT,
  effect,
  inject,
  input,
  resource,
  signal,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { AnalyticsService } from '@/app/analytics.service';
import { ErrorHandlerService } from '@/app/error/error-handler.service';
import { ConsentRequestService } from '@/entities/api';
import { AgridataStateService } from '@/entities/api/agridata-state.service';
import { ConsentRequestAggregationStateEnum, ConsentRequestStateEnum } from '@/entities/openapi';
import {
  FORCE_RELOAD_CONSENT_REQUESTS_STATE_PARAM,
  REDIRECT_TIMEOUT,
} from '@/pages/consent-request-producer';
import {
  getAggregationBadgeVariant,
  getToastMessage,
  getToastTitle,
  getToastType,
  getUndoAction,
} from '@/shared/consent-request';
import { formatDate } from '@/shared/date';
import { ErrorOutletComponent } from '@/shared/error-alert-outlet/error-outlet.component';
import { I18nDirective, I18nPipe } from '@/shared/i18n';
import { I18nService } from '@/shared/i18n/i18n.service';
import {
  createResourceErrorHandlerEffect,
  createResourceValueComputed,
} from '@/shared/lib/api.helper';
import { ScrollFadeDirective } from '@/shared/scroll-fade';
import { SidepanelComponent } from '@/shared/sidepanel';
import { ToastService } from '@/shared/toast';
import { AgridataBadgeComponent, BadgeSize } from '@/shared/ui/badge';
import { ButtonComponent, ButtonVariants } from '@/shared/ui/button';
import { ModalComponent } from '@/shared/ui/modal';
import { startCountdown } from '@/shared/utils/ui.util';
import { AlertComponent, AlertType } from '@/widgets/alert';
import { DataRequestContentComponent } from '@/widgets/data-request-content';

/**
 * Implements the logic for displaying detailed consent request information. It renders metadata
 * such as dates, state, consumer identity, description, purpose, and related products. The
 * component supports approving or rejecting requests, provides undo actions, and displays
 * contextual toast notifications. When a valid redirect URI is provided, the component shows
 * a modal with a countdown timer before automatically redirecting the user to the specified URL.
 *
 * CommentLastReviewed: 2026-08-04
 */
@Component({
  selector: 'app-consent-request-details',
  imports: [
    AgridataBadgeComponent,
    AlertComponent,
    ButtonComponent,
    DataRequestContentComponent,
    ErrorOutletComponent,
    I18nDirective,
    I18nPipe,
    ModalComponent,
    ScrollFadeDirective,
    SidepanelComponent,
  ],
  templateUrl: './consent-request-details.component.html',
})
export class ConsentRequestDetailsComponent {
  // Injects
  protected readonly agridataStateService = inject(AgridataStateService);
  private readonly activeRoute = inject(ActivatedRoute);
  private readonly analyticsService = inject(AnalyticsService);
  private readonly consentRequestService = inject(ConsentRequestService);
  // Use the injected DOCUMENT instead of globalThis/window.location so redirects go through a
  // mockable seam in tests. jsdom 26 (Angular 22 toolchain) fully locks window.location, making it
  // impossible to stub directly. SonarQube prefers globalThis over window, but DOCUMENT is both
  // Sonar-clean and testable.
  private readonly document = inject(DOCUMENT);
  private readonly errorService = inject(ErrorHandlerService);
  private readonly i18nService = inject(I18nService);
  private readonly router = inject(Router);
  private readonly toastService = inject(ToastService);

  // Input properties
  readonly aggregationId = input<string | undefined>();

  // Constants
  protected readonly AlertType = AlertType;
  protected readonly badgeSize = BadgeSize;
  protected readonly ButtonVariants = ButtonVariants;

  // Timers
  private countdownTimer?: ReturnType<typeof setInterval>;
  private redirectTimeout?: ReturnType<typeof setTimeout>;

  // Signals
  protected readonly countdownValue = signal(REDIRECT_TIMEOUT / 1000);
  protected readonly redirectUrl = signal<string | null>(null);
  protected readonly shouldRedirect = signal<boolean>(false);
  protected readonly showRedirect = signal<boolean>(false);
  protected readonly showAcceptedLoading = signal(false);
  protected readonly showRejectedLoading = signal(false);

  private readonly onSameNavigationReload = signal(false);
  private readonly refreshListNeeded = signal(false);
  protected readonly detailsOpened = signal(false);

  // Computed Signals
  protected readonly badgeText = computed(() => {
    const stateCode = this.request()?.stateCode;
    const params = { date: this.formattedLastStateChangeDate() };
    switch (stateCode) {
      case ConsentRequestAggregationStateEnum.Opened:
        return { key: 'consent-request.details.stateCode.OPENED' };
      case ConsentRequestAggregationStateEnum.PartiallyOpened:
        return { key: 'consent-request.details.stateCode.PARTIALLY_OPENED' };
      case ConsentRequestAggregationStateEnum.Granted:
        return { key: 'consent-request.details.stateCode.GRANTED', params };
      case ConsentRequestAggregationStateEnum.PartiallyGranted:
        return { key: 'consent-request.details.stateCode.PARTIALLY_GRANTED', params };
      case ConsentRequestAggregationStateEnum.Declined:
        return { key: 'consent-request.details.stateCode.DECLINED', params };
      default:
        return { key: 'consent-request.details.stateCode.UNKNOWN' };
    }
  });
  protected readonly badgeVariant = computed(() =>
    getAggregationBadgeVariant(this.request()?.stateCode),
  );
  protected readonly consentRequestResource = resource({
    params: () => ({
      id: this.aggregationId(),
      uid: this.agridataStateService.activeUid(),
    }),
    loader: ({ params }) => {
      if (!params?.id || !params.uid) {
        return Promise.resolve(undefined);
      }
      return this.consentRequestService.fetchConsentRequestAggregation(params.id, params.uid);
    },
  });
  protected readonly formattedLastStateChangeDate = computed(() =>
    formatDate(this.request()?.lastStateChangeDate),
  );
  protected readonly formattedRequestDate = computed(() => formatDate(this.request()?.requestDate));
  protected readonly request = createResourceValueComputed(this.consentRequestResource);
  // Disabled by the current decision state; impersonation is OR-ed in the template.
  protected readonly acceptDisabled = computed(
    () => this.governingStateCode() === ConsentRequestStateEnum.Granted,
  );
  protected readonly rejectDisabled = computed(
    () => this.governingStateCode() === ConsentRequestStateEnum.Declined,
  );
  protected readonly requestTitle = computed(() =>
    this.i18nService.useObjectTranslation(this.request()?.dataRequest?.title),
  );
  // Every consent request still awaiting a decision, affected together like the table does.
  private readonly openConsentRequestIds = computed(() =>
    (this.request()?.consentRequests ?? [])
      .filter((cr) => cr.stateCode === ConsentRequestStateEnum.Opened)
      .map((cr) => cr.id),
  );
  // PARTIALLY_GRANTED (all children decided, mixed) follows its first child until proper multi-child
  // handling lands; every other aggregation state governs the buttons directly.
  // acceptDisabled/rejectDisabled compare this against ConsentRequestStateEnum members; that only
  // works because both generated enums share the GRANTED/OPENED/DECLINED literal values.
  private readonly governingStateCode = computed<string | undefined>(() => {
    const aggregationState = this.request()?.stateCode;
    return aggregationState === ConsentRequestAggregationStateEnum.PartiallyGranted
      ? this.request()?.consentRequests?.[0]?.stateCode
      : aggregationState;
  });

  // Effects
  private readonly checkResourceLoadedEffect = effect(() => {
    if (!this.consentRequestResource.isLoading()) {
      this.detailsOpened.set(true);
    }
  });
  private readonly checkForRedirectEffect = effect(() => {
    const request = this.request();
    const redirectUri = this.activeRoute.snapshot.queryParamMap.get('redirect_uri') ?? undefined;
    if (redirectUri) {
      this.redirectUrl.set(redirectUri);
      const redirectUrlPattern = request?.dataRequest?.validRedirectUriRegex;

      if (!redirectUrlPattern) {
        this.resetRedirect();
        return;
      }

      try {
        // we can ignore the lint warning here as we trust the pattern from our own backend
        /* eslint-disable-next-line security/detect-non-literal-regexp */
        const redirectRegex = new RegExp(redirectUrlPattern);

        if (!redirectRegex?.test(redirectUri)) {
          this.resetRedirect();
          return;
        }

        // Clean up state to prevent persistence when returning to the page
        // by replacing current history entry with a clean one
        globalThis.history.replaceState(
          {},
          '',
          this.agridataStateService.currentRouteWithoutQueryParams(),
        );
        this.shouldRedirect.set(true);
      } catch (error) {
        console.warn(
          `Invalid regex pattern provided: '${redirectUrlPattern}', error: ${error instanceof Error ? error.message : error}`,
        );
        this.resetRedirect();
        return;
      }
    }
  });
  private readonly errorHandlerEffect = createResourceErrorHandlerEffect(
    this.consentRequestResource,
    this.errorService,
  );
  private readonly startTimerEffect = effect((onCleanup) => {
    this.clearAllTimers();
    if (this.showRedirect()) {
      this.startCountdown();

      this.redirectTimeout = setTimeout(() => {
        const url = this.redirectUrl();

        this.clearAllTimers();
        this.resetRedirect();
        if (url) {
          this.document.location.href = url;
        }
      }, REDIRECT_TIMEOUT);

      onCleanup(() => {
        this.clearAllTimers();
        this.resetRedirect();
      });
    }
  });

  protected async acceptRequest(): Promise<void> {
    this.showAcceptedLoading.set(true);
    await this.changeConsentRequestState(ConsentRequestStateEnum.Granted);
    this.showAcceptedLoading.set(false);
  }

  protected handleCloseDetails(): void {
    if (!this.shouldRedirect()) {
      this.router
        .navigate(['../'], {
          relativeTo: this.activeRoute,
          onSameUrlNavigation: this.onSameNavigationReload() ? 'reload' : 'ignore',
          state: { [FORCE_RELOAD_CONSENT_REQUESTS_STATE_PARAM]: this.refreshListNeeded() },
        })
        .then();
    }
  }

  protected readonly redirectDirectly = (): void => {
    const url = this.redirectUrl();
    if (url) {
      this.clearAllTimers();
      this.resetRedirect();
      this.document.location.href = url;
    }
  };

  protected async rejectRequest(): Promise<void> {
    this.showRejectedLoading.set(true);
    await this.changeConsentRequestState(ConsentRequestStateEnum.Declined);
    this.showRejectedLoading.set(false);
  }

  // Affects every consent request still awaiting a decision (like the table). If none are open the
  // aggregation is already decided, so the first child is flipped instead. Undo restores the previous
  // state: OPENED for the open children, or the first child's decided state for a flip.
  private async changeConsentRequestState(newState: ConsentRequestStateEnum): Promise<void> {
    const consentRequests = this.request()?.consentRequests ?? [];
    const openIds = this.openConsentRequestIds();

    let ids: string[];
    let undoState: ConsentRequestStateEnum | undefined;
    if (openIds.length > 0) {
      ids = openIds;
      undoState = ConsentRequestStateEnum.Opened;
    } else {
      const first = consentRequests[0];
      if (!first?.id) {
        return;
      }
      ids = [first.id];
      undoState = first.stateCode;
    }

    const updated = await this.updateAndReloadConsentRequestState(ids, newState);
    if (!updated) {
      return;
    }
    this.analyticsService.logEvent('consent_request_state_changed', {
      id: this.request()?.id,
      state: newState,
      component: 'details',
    });
    this.showRedirect.set(this.shouldRedirect());
    if (!this.shouldRedirect()) {
      this.toastService.show(
        this.i18nService.translate(getToastTitle(newState)),
        this.i18nService.translate(getToastMessage(newState), {
          name: this.requestTitle(),
        }),
        getToastType(newState),
        undoState ? this.prepareUndoAction(ids, undoState) : undefined,
      );
    }
  }

  private prepareUndoAction(ids: string[], stateCode: ConsentRequestStateEnum) {
    return getUndoAction(() => {
      this.toastService.show(this.i18nService.translate(getToastTitle('')), '');
      this.onSameNavigationReload.set(true);
      this.updateAndReloadConsentRequestState(ids, stateCode);
    });
  }

  private updateAndReloadConsentRequestState(
    ids: string[],
    stateCode: ConsentRequestStateEnum,
  ): Promise<boolean> {
    return this.consentRequestService
      .updateConsentRequestStatuses(ids, stateCode)
      .then(() => {
        this.consentRequestResource?.reload();
        this.refreshListNeeded.set(true);
        this.handleCloseDetails();
        return true;
      })
      .catch((error) => {
        // a rejected Promise.all can still have updated some of the children, so pull the
        // authoritative states instead of leaving the panel stale
        this.errorService.handleError(error);
        this.consentRequestResource?.reload();
        return false;
      });
  }

  private clearAllTimers(): void {
    if (this.countdownTimer) {
      clearInterval(this.countdownTimer);
      this.countdownTimer = undefined;
    }
    if (this.redirectTimeout) {
      clearTimeout(this.redirectTimeout);
      this.redirectTimeout = undefined;
    }
  }

  private readonly resetRedirect = (): void => {
    this.redirectUrl.set(null);
    this.shouldRedirect.set(false);
    this.showRedirect.set(false);
  };

  private startCountdown(): void {
    this.countdownTimer = startCountdown(
      this.countdownValue,
      REDIRECT_TIMEOUT / 1000,
      this.countdownTimer,
    );
  }
}
