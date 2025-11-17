import {
  Component,
  computed,
  effect,
  inject,
  input,
  resource,
  Signal,
  signal,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

import { AnalyticsService } from '@/app/analytics.service';
import { ErrorHandlerService } from '@/app/error/error-handler.service';
import { ConsentRequestService } from '@/entities/api';
import { AgridataStateService } from '@/entities/api/agridata-state.service';
import { MetaDataService } from '@/entities/api/meta-data-service';
import { ConsentRequestStateEnum, DataRequestPurposeDto } from '@/entities/openapi';
import { FORCE_RELOAD_CONSENT_REQUESTS_STATE_PARAM } from '@/pages/consent-request-producer';
import { REDIRECT_TIMEOUT } from '@/pages/consent-request-producer/consent-request-producer.page.model';
import {
  getToastMessage,
  getToastTitle,
  getToastType,
  getUndoAction,
} from '@/shared/consent-request';
import { formatDate } from '@/shared/date';
import { I18nDirective, I18nPipe } from '@/shared/i18n';
import { I18nService } from '@/shared/i18n/i18n.service';
import {
  createResourceErrorHandlerEffect,
  createResourceValueComputed,
} from '@/shared/lib/api.helper';
import { SidepanelComponent } from '@/shared/sidepanel';
import { ToastService } from '@/shared/toast';
import { AvatarSize, AvatarSkin } from '@/shared/ui/agridata-avatar';
import { AgridataBadgeComponent, BadgeSize, BadgeVariant } from '@/shared/ui/badge';
import { ButtonComponent, ButtonVariants } from '@/shared/ui/button';
import { ModalComponent } from '@/shared/ui/modal/modal.component';
import { ErrorOutletComponent } from '@/styles/error-alert-outlet/error-outlet.component';
import { AgridataContactCardComponent } from '@/widgets/agridata-contact-card';
import { AlertComponent, AlertType } from '@/widgets/alert';
import { DataRequestContactComponent } from '@/widgets/data-request-contact';
import { DataRequestPrivacyInfosComponent } from '@/widgets/data-request-privacy-infos';
import { DataRequestPurposeAccordionComponent } from '@/widgets/data-request-purpose-accordion';

/**
 * Implements the logic for displaying detailed consent request information. It renders metadata
 * such as dates, state, consumer identity, description, purpose, and related products. The
 * component supports approving or rejecting requests, provides undo actions, and displays
 * contextual toast notifications.
 *
 * CommentLastReviewed: 2025-09-30
 */
@Component({
  selector: 'app-consent-request-details',
  imports: [
    FontAwesomeModule,
    DataRequestPurposeAccordionComponent,
    AgridataBadgeComponent,
    I18nPipe,
    I18nDirective,
    SidepanelComponent,
    ButtonComponent,
    DataRequestPrivacyInfosComponent,
    DataRequestContactComponent,
    ErrorOutletComponent,
    AgridataContactCardComponent,
    AlertComponent,
    ModalComponent,
  ],
  templateUrl: './consent-request-details.component.html',
})
export class ConsentRequestDetailsComponent {
  public readonly agridataStateService = inject(AgridataStateService);
  private readonly toastService = inject(ToastService);
  private readonly consentRequestService = inject(ConsentRequestService);
  private readonly metaDataService = inject(MetaDataService);
  private readonly i18nService = inject(I18nService);
  private readonly analyticsService = inject(AnalyticsService);
  private readonly errorService = inject(ErrorHandlerService);
  private readonly router = inject(Router);
  private readonly activeRoute = inject(ActivatedRoute);

  // input from route parameter :consentRequestId
  readonly consentRequestId = input<string | undefined>();

  readonly redirectUrl = signal<string | null>(null);
  readonly showRedirect = signal<boolean>(false);
  readonly countdownValue = signal(REDIRECT_TIMEOUT / 1000);
  readonly shouldRedirect = signal<boolean>(false);
  private readonly refreshListNeeded = signal(false);
  // this is primarily needed if the details screen is already closed and the user decides to undo (making sure the list reloads then)
  private readonly onSameNavigationReload = signal(false);

  // Store timers at class level so they can be accessed and cleared from anywhere
  private countdownTimer?: ReturnType<typeof setInterval>;
  private redirectTimeout?: ReturnType<typeof setTimeout>;

  readonly badgeSize = BadgeSize;
  readonly consentRequestStateEnum = ConsentRequestStateEnum;
  readonly ButtonVariants = ButtonVariants;
  readonly AvatarSize = AvatarSize;
  readonly AvatarSkin = AvatarSkin;
  readonly AlertType = AlertType;

  readonly requestStateCode: Signal<string> = computed(() => String(this.request()?.stateCode));

  readonly currentLanguage = computed(() => this.i18nService.lang());
  readonly requestId = computed(() => this.request()?.id);
  readonly formattedRequestDate = computed(() => formatDate(this.request()?.requestDate));
  readonly formattedLastStateChangeDate = computed(() =>
    formatDate(this.request()?.lastStateChangeDate),
  );
  readonly dataConsumerName = computed(() => this.request()?.dataRequest?.dataConsumerDisplayName);
  readonly requestConsumerLogo = computed(
    () => this.request()?.dataRequest?.dataConsumerLogoBase64,
  );
  readonly dataConsumerCity = computed(() => this.request()?.dataRequest?.dataConsumerCity);

  readonly requestTitle = computed(() =>
    this.i18nService.useObjectTranslation(this.request()?.dataRequest?.title),
  );
  readonly requestDescription = computed(() =>
    this.i18nService.useObjectTranslation(this.request()?.dataRequest?.description),
  );
  readonly requestPurpose = computed(() => {
    const purpose = this.request()?.dataRequest?.purpose;
    return (
      (purpose as Record<string, string>)?.[this.currentLanguage()] ?? ('' as DataRequestPurposeDto)
    );
  });
  readonly requestProducts = computed(() =>
    this.metaDataService
      .getDataProducts()()
      ?.filter((product) => this.request()?.dataRequest?.products?.includes(product.id)),
  );
  readonly badgeText = computed(() => {
    const stateCode = this.request()?.stateCode;
    if (stateCode === ConsentRequestStateEnum.Opened)
      return { key: 'consent-request.details.stateCode.OPENED' };
    if (stateCode === ConsentRequestStateEnum.Granted)
      return {
        key: 'consent-request.details.stateCode.GRANTED',
        params: { date: this.formattedLastStateChangeDate() },
      };
    if (stateCode === ConsentRequestStateEnum.Declined)
      return {
        key: 'consent-request.details.stateCode.DECLINED',
        params: { date: this.formattedLastStateChangeDate() },
      };

    return { key: 'consent-request.details.stateCode.UNKNOWN' };
  });
  readonly badgeVariant = computed(() => {
    const stateCode = this.request()?.stateCode;
    if (stateCode === ConsentRequestStateEnum.Opened) return BadgeVariant.INFO;
    if (stateCode === ConsentRequestStateEnum.Granted) return BadgeVariant.SUCCESS;
    if (stateCode === ConsentRequestStateEnum.Declined) return BadgeVariant.ERROR;
    return BadgeVariant.DEFAULT;
  });

  protected readonly consentRequestResource = resource({
    params: () => ({ id: this.consentRequestId() }),
    loader: ({ params }) => {
      if (!params?.id) {
        return Promise.resolve(undefined);
      }
      return this.consentRequestService.fetchConsentRequest(params.id);
    },
  });

  private readonly errorHandlerEffect = createResourceErrorHandlerEffect(
    this.consentRequestResource,
    this.errorService,
  );

  readonly request = createResourceValueComputed(this.consentRequestResource);

  private readonly checkForRedirectEffect = effect(() => {
    const request = this.request();
    const redirectUri = history.state?.redirect_uri;

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
        globalThis.history.replaceState({}, '', globalThis.location.href);
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
  readonly startTimerEffect = effect((onCleanup) => {
    this.clearAllTimers();
    if (this.showRedirect()) {
      this.startCountdown();

      this.redirectTimeout = setTimeout(() => {
        const url = this.redirectUrl();

        this.clearAllTimers();
        this.resetRedirect();
        if (url) {
          globalThis.location.href = url;
        }
      }, REDIRECT_TIMEOUT);

      onCleanup(() => {
        this.clearAllTimers();
        this.resetRedirect();
      });
    }
  });

  handleCloseDetails() {
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

  async acceptRequest() {
    const id = this.requestId();
    if (!id) {
      throw new Error('unable to accept consent request: missing id');
    }
    this.analyticsService.logEvent('consent_request_state_changed', {
      id: this.requestId(),
      state: ConsentRequestStateEnum.Granted,
      component: 'details',
    });
    this.refreshListNeeded.set(true);
    await this.updateAndReloadConsentRequestState(id, ConsentRequestStateEnum.Granted);
    this.showRedirect.set(this.shouldRedirect());
    if (!this.shouldRedirect()) {
      this.toastService.show(
        this.i18nService.translate(getToastTitle(ConsentRequestStateEnum.Granted)),
        this.i18nService.translate(getToastMessage(ConsentRequestStateEnum.Granted), {
          name: this.requestTitle(),
        }),
        getToastType(ConsentRequestStateEnum.Granted),
        this.prepareUndoAction(id, this.requestStateCode()),
      );
    }
  }

  async rejectRequest() {
    const id = this.requestId();
    if (!id) {
      throw new Error('unable to reject consent request: missing id');
    }

    this.analyticsService.logEvent('consent_request_state_changed', {
      id: id,
      state: ConsentRequestStateEnum.Declined,
      component: 'details',
    });
    this.refreshListNeeded.set(true);
    await this.updateAndReloadConsentRequestState(id, ConsentRequestStateEnum.Declined);
    if (!this.shouldRedirect()) {
      const toastTitle = this.i18nService.translate(
        getToastTitle(ConsentRequestStateEnum.Declined),
      );
      const toastMessage = this.i18nService.translate(
        getToastMessage(ConsentRequestStateEnum.Declined),
        { name: this.requestTitle() },
      );
      const toastType = getToastType(ConsentRequestStateEnum.Declined);
      this.toastService.show(
        toastTitle,
        toastMessage,
        toastType,
        this.prepareUndoAction(id, this.requestStateCode()),
      );
    }
  }

  prepareUndoAction(id: string, stateCode: string) {
    return getUndoAction(() => {
      this.toastService.show(this.i18nService.translate(getToastTitle('')), '');
      this.onSameNavigationReload.set(true);
      this.updateAndReloadConsentRequestState(id, stateCode);
    });
  }

  async updateAndReloadConsentRequestState(id: string, stateCode: string) {
    await this.consentRequestService.updateConsentRequestStatus(id, stateCode);
    this.consentRequestResource?.reload();
    this.refreshListNeeded.set(true);
    this.handleCloseDetails();
  }

  private readonly resetRedirect = () => {
    this.redirectUrl.set(null);
    this.shouldRedirect.set(false);
    this.showRedirect.set(false);
  };

  private startCountdown(): void {
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
