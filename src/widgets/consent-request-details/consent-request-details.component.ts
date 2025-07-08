import { Component, Signal, computed, effect, inject, input, output, signal } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faLock, faPenSquare, faRepeat } from '@fortawesome/free-solid-svg-icons';

import { ConsentRequestService } from '@/entities/api';
import { ConsentRequestDto, ConsentRequestStateEnum } from '@/entities/openapi';
import {
  getToastMessage,
  getToastTitle,
  getToastType,
  getUndoAction,
} from '@/shared/consent-request';
import { formatDate } from '@/shared/date';
import { I18nPipe } from '@/shared/i18n';
import { I18nService } from '@/shared/i18n/i18n.service';
import { SidepanelComponent } from '@/shared/sidepanel';
import { ToastService } from '@/shared/toast';
import { AgridataBadgeComponent, BadgeSize, BadgeVariant } from '@/shared/ui/badge';
import { ButtonComponent, ButtonVariants } from '@/shared/ui/button';
import { AgridataAccordionComponent } from '@/widgets/agridata-accordion';

@Component({
  selector: 'app-consent-request-details',
  imports: [
    FontAwesomeModule,
    AgridataAccordionComponent,
    AgridataBadgeComponent,
    I18nPipe,
    SidepanelComponent,
    ButtonComponent,
  ],
  templateUrl: './consent-request-details.component.html',
})
export class ConsentRequestDetailsComponent {
  private readonly toastService = inject(ToastService);
  private readonly consentRequestService = inject(ConsentRequestService);
  private readonly i18nService = inject(I18nService);

  readonly request = input<ConsentRequestDto | null>(null);
  readonly onReloadConsentRequests = output<void>();
  readonly onCloseDetail = output<string | null>();

  readonly editIcon = faPenSquare;
  readonly lockIcon = faLock;
  readonly repeatIcon = faRepeat;
  readonly badgeSize = BadgeSize;
  readonly consentRequestStateEnum = ConsentRequestStateEnum;
  readonly ButtonVariants = ButtonVariants;

  readonly showSuccessToast = signal<boolean>(false);
  readonly showErrorToast = signal<boolean>(false);
  readonly showDetails = signal(false);
  readonly requestStateCode: Signal<string> = computed(() => String(this.request()?.stateCode));
  readonly requestId = computed(() => this.request()?.id ?? '');
  readonly formattedRequestDate = computed(() => formatDate(this.request()?.requestDate));
  readonly formattedLastStateChangeDate = computed(() =>
    formatDate(this.request()?.lastStateChangeDate),
  );
  readonly dataConsumerName = computed(() => this.request()?.dataRequest?.dataConsumerDisplayName);
  readonly requestTitle = computed(() =>
    this.i18nService.useObjectTranslation(this.request()?.dataRequest?.title),
  );
  readonly requestDescription = computed(() =>
    this.i18nService.useObjectTranslation(this.request()?.dataRequest?.description),
  );
  readonly requestPurpose = computed(() =>
    this.i18nService.useObjectTranslation(this.request()?.dataRequest?.purpose),
  );
  readonly privacySections = computed(() => {
    return [
      {
        icon: this.editIcon,
        title: 'consent-request-details.privacySection.consent.title',
        description: 'consent-request-details.privacySection.consent.description',
      },
      {
        icon: this.lockIcon,
        title: 'consent-request-details.privacySection.dataProtection.title',
        description: 'consent-request-details.privacySection.dataProtection.description',
        translationParams: { consumerName: this.dataConsumerName() },
      },
      {
        icon: this.repeatIcon,
        title: 'consent-request-details.privacySection.revocation.title',
        description: 'consent-request-details.privacySection.revocation.description',
      },
    ];
  });
  readonly badgeText = computed(() => {
    const stateCode = this.request()?.stateCode;
    if (stateCode === ConsentRequestStateEnum.Opened)
      return { key: 'consent-request-details.dataRequest.state.OPENED' };
    if (stateCode === ConsentRequestStateEnum.Granted)
      return {
        key: 'consent-request-details.dataRequest.state.GRANTED',
        params: { date: this.formattedLastStateChangeDate() },
      };
    if (stateCode === ConsentRequestStateEnum.Declined)
      return {
        key: 'consent-request-details.dataRequest.state.DECLINED',
        params: { date: this.formattedLastStateChangeDate() },
      };

    return { key: 'consent-request-details.dataRequest.state.UNKNOWN' };
  });
  readonly badgeVariant = computed(() => {
    const stateCode = this.request()?.stateCode;
    if (stateCode === ConsentRequestStateEnum.Opened) return BadgeVariant.INFO;
    if (stateCode === ConsentRequestStateEnum.Granted) return BadgeVariant.SUCCESS;
    if (stateCode === ConsentRequestStateEnum.Declined) return BadgeVariant.ERROR;
    return BadgeVariant.DEFAULT;
  });

  constructor() {
    effect(() => {
      if (this.request()) {
        this.showDetails.set(true);
      }
    });
  }

  handleCloseDetails() {
    this.showDetails.set(false);
    this.onCloseDetail.emit(null);
  }

  async acceptRequest() {
    this.toastService.show(
      this.i18nService.translate(getToastTitle(ConsentRequestStateEnum.Granted)),
      this.i18nService.translate(getToastMessage(ConsentRequestStateEnum.Granted), {
        name: this.requestTitle(),
      }),
      getToastType(ConsentRequestStateEnum.Granted),
      this.prepareUndoAction(this.requestId(), this.requestStateCode()),
    );
    this.updateAndReloadConsentRequestState(this.requestId(), ConsentRequestStateEnum.Granted);
  }

  async rejectRequest() {
    const toastTitle = this.i18nService.translate(getToastTitle(ConsentRequestStateEnum.Declined));
    const toastMessage = this.i18nService.translate(
      getToastMessage(ConsentRequestStateEnum.Declined),
      { name: this.requestTitle() },
    );
    const toastType = getToastType(ConsentRequestStateEnum.Declined);
    this.toastService.show(
      toastTitle,
      toastMessage,
      toastType,
      this.prepareUndoAction(this.requestId(), this.requestStateCode()),
    );
    this.updateAndReloadConsentRequestState(this.requestId(), ConsentRequestStateEnum.Declined);
  }

  prepareUndoAction(id: string, stateCode: string) {
    return getUndoAction(() => {
      this.toastService.show(this.i18nService.translate(getToastTitle('')), '');
      this.updateAndReloadConsentRequestState(id, stateCode);
    });
  }

  async updateAndReloadConsentRequestState(id: string, stateCode: string) {
    this.consentRequestService.updateConsentRequestStatus(id, stateCode).then(() => {
      this.onReloadConsentRequests.emit();
    });
    this.handleCloseDetails();
  }
}
