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
 * contextual toast notifications. When a valid redirect URI is provided, the component shows
 * a modal with a countdown timer before automatically redirecting the user to the specified URL.
 *
 * CommentLastReviewed: 2025-11-17
 */
@Component({
  selector: 'app-consent-request-details',
  imports: [
    AgridataBadgeComponent,
    AgridataContactCardComponent,
    AlertComponent,
    ButtonComponent,
    DataRequestContactComponent,
    DataRequestPrivacyInfosComponent,
    DataRequestPurposeAccordionComponent,
    ErrorOutletComponent,
    FontAwesomeModule,
    I18nDirective,
    I18nPipe,
    ModalComponent,
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
  private readonly errorService = inject(ErrorHandlerService);
  private readonly i18nService = inject(I18nService);
  private readonly metaDataService = inject(MetaDataService);
  private readonly router = inject(Router);
  private readonly toastService = inject(ToastService);

  // Input properties
  readonly consentRequestId = input<string | undefined>();

  // Constants
  protected readonly AlertType = AlertType;
  protected readonly AvatarSize = AvatarSize;
  protected readonly AvatarSkin = AvatarSkin;
  protected readonly badgeSize = BadgeSize;
  protected readonly ButtonVariants = ButtonVariants;
  protected readonly consentRequestStateEnum = ConsentRequestStateEnum;

  // Timers
  private countdownTimer?: ReturnType<typeof setInterval>;
  private redirectTimeout?: ReturnType<typeof setTimeout>;

  // Signals
  protected readonly countdownValue = signal(REDIRECT_TIMEOUT / 1000);
  protected readonly redirectUrl = signal<string | null>(null);
  protected readonly shouldRedirect = signal<boolean>(false);
  protected readonly showRedirect = signal<boolean>(false);
  private readonly onSameNavigationReload = signal(false);
  private readonly refreshListNeeded = signal(false);

  // Computed Signals
  protected readonly detailsOpened = signal(false);
  protected readonly badgeText = computed(() => {
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
  protected readonly badgeVariant = computed(() => {
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
  protected readonly currentLanguage = computed(() => this.i18nService.lang());
  protected readonly dataConsumerCity = computed(
    () => this.request()?.dataRequest?.dataConsumerCity,
  );
  protected readonly dataConsumerName = computed(
    () => this.request()?.dataRequest?.dataConsumerDisplayName,
  );
  protected readonly formattedLastStateChangeDate = computed(() =>
    formatDate(this.request()?.lastStateChangeDate),
  );
  protected readonly formattedRequestDate = computed(() => formatDate(this.request()?.requestDate));
  protected readonly request = createResourceValueComputed(this.consentRequestResource);
  protected readonly requestConsumerLogo = computed(
    () => this.request()?.dataRequest?.dataConsumerLogoBase64,
  );
  protected readonly requestDescription = computed(() =>
    this.i18nService.useObjectTranslation(this.request()?.dataRequest?.description),
  );
  protected readonly requestId = computed(() => this.request()?.id);
  protected readonly requestProducts = computed(() =>
    this.metaDataService
      .getDataProducts()()
      ?.filter((product) => this.request()?.dataRequest?.products?.includes(product.id)),
  );
  protected readonly requestPurpose = computed(() => {
    const purpose = this.request()?.dataRequest?.purpose;
    return (
      (purpose as Record<string, string>)?.[this.currentLanguage()] ?? ('' as DataRequestPurposeDto)
    );
  });
  protected readonly requestStateCode: Signal<string> = computed(() =>
    String(this.request()?.stateCode),
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
          globalThis.location.href = url;
        }
      }, REDIRECT_TIMEOUT);

      onCleanup(() => {
        this.clearAllTimers();
        this.resetRedirect();
      });
    }
  });

  protected async acceptRequest(): Promise<void> {
    await this.changeConsentRequestState(ConsentRequestStateEnum.Granted);
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
      globalThis.location.href = url;
    }
  };

  protected async rejectRequest(): Promise<void> {
    await this.changeConsentRequestState(ConsentRequestStateEnum.Declined);
  }

  private async changeConsentRequestState(newState: ConsentRequestStateEnum): Promise<void> {
    const id = this.requestId();
    if (!id) {
      throw new Error(
        `unable to ${newState === ConsentRequestStateEnum.Granted ? 'accept' : 'reject'} consent request: missing id`,
      );
    }

    this.analyticsService.logEvent('consent_request_state_changed', {
      id: id,
      state: newState,
      component: 'details',
    });
    this.refreshListNeeded.set(true);
    await this.updateAndReloadConsentRequestState(id, newState);
    this.showRedirect.set(this.shouldRedirect());
    if (!this.shouldRedirect()) {
      this.toastService.show(
        this.i18nService.translate(getToastTitle(newState)),
        this.i18nService.translate(getToastMessage(newState), {
          name: this.requestTitle(),
        }),
        getToastType(newState),
        this.prepareUndoAction(id, this.requestStateCode()),
      );
    }
  }

  private prepareUndoAction(id: string, stateCode: string) {
    return getUndoAction(() => {
      this.toastService.show(this.i18nService.translate(getToastTitle('')), '');
      this.onSameNavigationReload.set(true);
      this.updateAndReloadConsentRequestState(id, stateCode);
    });
  }

  private async updateAndReloadConsentRequestState(id: string, stateCode: string): Promise<void> {
    await this.consentRequestService.updateConsentRequestStatus(id, stateCode);
    this.consentRequestResource?.reload();
    this.refreshListNeeded.set(true);
    this.handleCloseDetails();
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
}
