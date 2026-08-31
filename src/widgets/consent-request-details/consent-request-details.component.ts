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
  ConsentRequestDecisionStore,
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

type DecisionTarget = { id: string; previousState?: ConsentRequestStateEnum };

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
  providers: [ConsentRequestDecisionStore],
  templateUrl: './consent-request-details.component.html',
})
export class ConsentRequestDetailsComponent {
  // Injects
  protected readonly agridataStateService = inject(AgridataStateService);
  protected readonly decisionStore = inject(ConsentRequestDecisionStore);
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
  protected readonly showSaveLoading = signal(false);

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
      case ConsentRequestAggregationStateEnum.LegallyPermitted:
        return { key: 'consent-request.details.stateCode.LEGALLY_PERMITTED', params };
      default:
        return { key: 'consent-request.details.stateCode.UNKNOWN' };
    }
  });
  protected readonly badgeVariant = computed(() =>
    getAggregationBadgeVariant(this.request()?.stateCode),
  );
  protected readonly noConsentRequired = computed(
    () => this.request()?.stateCode === ConsentRequestAggregationStateEnum.LegallyPermitted,
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
  // Disabled when nothing would change to that state (every relevant child already has it);
  // impersonation is OR-ed in the template.
  protected readonly acceptDisabled = computed(
    () => this.decisionTargets(ConsentRequestStateEnum.Granted).length === 0,
  );
  protected readonly rejectDisabled = computed(
    () => this.decisionTargets(ConsentRequestStateEnum.Declined).length === 0,
  );
  // At least one BUR must stay accepted; scoped to edit mode since grantedCount is 0 outside it too
  // and the footer text renders in both modes.
  protected readonly noBurGranted = computed(
    () => this.decisionStore.editMode() && this.decisionStore.grantedCount() === 0,
  );
  protected readonly requestTitle = computed(() =>
    this.i18nService.useObjectTranslation(this.request()?.dataRequest?.title),
  );

  // Effects
  private readonly checkResourceLoadedEffect = effect(() => {
    if (!this.consentRequestResource.isLoading()) {
      this.detailsOpened.set(true);
    }
  });
  // Feeds the per-BUR decisions list rendered inside the data-request-content body.
  private readonly syncDecisionStoreEffect = effect(() => {
    this.decisionStore.consentRequests.set(this.request()?.consentRequests ?? []);
    this.decisionStore.dataRequestStateCode.set(this.request()?.stateCode);
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

  protected cancelEdit(): void {
    this.decisionStore.cancelEdit();
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

  // Submits the edit-mode decisions: each BUR child by its toggle (on = granted, off = declined).
  // The UID child is left untouched - the backend derives it from the BUR children. Only children
  // whose state actually changes are sent (the backend rejects no-op transitions like GRANTED ->
  // GRANTED).
  protected async saveBurDecisions(): Promise<void> {
    const decisions = this.decisionStore.decisions();
    const grantIds: string[] = [];
    const declineIds: string[] = [];

    for (const request of this.decisionStore.burRequests()) {
      const desired = decisions[request.id]
        ? ConsentRequestStateEnum.Granted
        : ConsentRequestStateEnum.Declined;
      if (request.stateCode !== desired) {
        (decisions[request.id] ? grantIds : declineIds).push(request.id);
      }
    }

    if (grantIds.length === 0 && declineIds.length === 0) {
      this.decisionStore.cancelEdit();
      return;
    }

    this.showSaveLoading.set(true);
    const updated = await this.applyStateChanges(
      new Map([
        [ConsentRequestStateEnum.Granted, grantIds],
        [ConsentRequestStateEnum.Declined, declineIds],
      ]),
    );
    if (updated) {
      this.analyticsService.logEvent('consent_request_state_changed', {
        id: this.request()?.id,
        state: 'per-bur',
        component: 'details',
      });
      this.decisionStore.cancelEdit();
    }
    this.showSaveLoading.set(false);
  }

  // Applies newState to every BUR child that differs from it; the UID child is only touched when
  // there is no BUR child (otherwise the backend derives it). Undo restores each child's exact
  // prior state.
  private async changeConsentRequestState(newState: ConsentRequestStateEnum): Promise<void> {
    const targets = this.decisionTargets(newState);
    if (targets.length === 0) {
      return;
    }
    const ids = targets.map((target) => target.id);

    const updated = await this.applyStateChanges(new Map([[newState, ids]]));
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
        this.prepareRestoreUndoAction(targets),
      );
    }
  }

  // Children that would actually change to newState: every BUR child that differs; the single UID
  // child only when there is no BUR child (the backend derives the UID decision otherwise).
  private decisionTargets(newState: ConsentRequestStateEnum): DecisionTarget[] {
    const consentRequests = this.request()?.consentRequests ?? [];
    const burRequests = consentRequests.filter((request) => request.dataProducerBur);
    const targets = burRequests
      .filter((request) => request.stateCode !== newState)
      .map((request) => ({ id: request.id, previousState: request.stateCode }));

    if (burRequests.length === 0) {
      const uidRequest = consentRequests.find((request) => !request.dataProducerBur);
      if (uidRequest && uidRequest.stateCode !== newState) {
        targets.push({ id: uidRequest.id, previousState: uidRequest.stateCode });
      }
    }
    return targets;
  }

  private prepareRestoreUndoAction(targets: DecisionTarget[]) {
    const idsByState = new Map<ConsentRequestStateEnum, string[]>();
    for (const target of targets) {
      if (!target.previousState) {
        continue;
      }
      const ids = idsByState.get(target.previousState) ?? [];
      ids.push(target.id);
      idsByState.set(target.previousState, ids);
    }

    return getUndoAction(() => {
      this.toastService.show(this.i18nService.translate(getToastTitle('')), '');
      this.onSameNavigationReload.set(true);
      this.applyStateChanges(idsByState);
    });
  }

  // Runs one updateConsentRequestStatuses call per non-empty state group. On success the panel
  // closes, so we skip reloading the (about-to-be-destroyed) detail resource and let the list
  // refresh via refreshListNeeded; on failure a rejected Promise.all may have updated some children,
  // so pull authoritative state instead of leaving the panel stale.
  private applyStateChanges(byState: Map<ConsentRequestStateEnum, string[]>): Promise<boolean> {
    const calls = [...byState.entries()]
      .filter(([, ids]) => ids.length > 0)
      .map(([stateCode, ids]) =>
        this.consentRequestService.updateConsentRequestStatuses(ids, stateCode),
      );
    return Promise.all(calls)
      .then(() => {
        this.refreshListNeeded.set(true);
        this.handleCloseDetails();
        return true;
      })
      .catch((error) => {
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
