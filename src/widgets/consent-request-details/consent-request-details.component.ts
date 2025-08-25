import { Component, Signal, computed, effect, inject, input, output, signal } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

import { ConsentRequestService } from '@/entities/api';
import { MetaDataService } from '@/entities/api/meta-data-service';
import {
  ConsentRequestProducerViewDto,
  ConsentRequestStateEnum,
  DataRequestPurposeDto,
} from '@/entities/openapi';
import {
  getToastMessage,
  getToastTitle,
  getToastType,
  getUndoAction,
} from '@/shared/consent-request';
import { formatDate } from '@/shared/date';
import { I18nDirective, I18nPipe } from '@/shared/i18n';
import { I18nService } from '@/shared/i18n/i18n.service';
import { SidepanelComponent } from '@/shared/sidepanel';
import { ToastService } from '@/shared/toast';
import { AgridataAvatarComponent, AvatarSize, AvatarSkin } from '@/shared/ui/agridata-avatar';
import { AgridataBadgeComponent, BadgeSize, BadgeVariant } from '@/shared/ui/badge';
import { ButtonComponent, ButtonVariants } from '@/shared/ui/button';
import { DataRequestPrivacyInfosComponent } from '@/widgets/data-request-privacy-infos';
import { DataRequestPurposeAccordionComponent } from '@/widgets/data-request-purpose-accordion';

/**
 * Implements the logic for displaying detailed consent request information. It renders metadata
 * such as dates, state, consumer identity, description, purpose, and related products. The
 * component supports approving or rejecting requests, provides undo actions, and displays
 * contextual toast notifications.
 *
 * CommentLastReviewed: 2025-08-25
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
    AgridataAvatarComponent,
  ],
  templateUrl: './consent-request-details.component.html',
})
export class ConsentRequestDetailsComponent {
  private readonly toastService = inject(ToastService);
  private readonly consentRequestService = inject(ConsentRequestService);
  readonly metaDataService = inject(MetaDataService);

  private readonly i18nService = inject(I18nService);
  private readonly dataRequestProducts = this.metaDataService.fetchDataProducts;

  readonly request = input<ConsentRequestProducerViewDto | null>(null);
  readonly onCloseDetail = output<string | null>();

  readonly badgeSize = BadgeSize;
  readonly consentRequestStateEnum = ConsentRequestStateEnum;
  readonly ButtonVariants = ButtonVariants;
  readonly AvatarSize = AvatarSize;
  readonly AvatarSkin = AvatarSkin;

  readonly showSuccessToast = signal<boolean>(false);
  readonly showErrorToast = signal<boolean>(false);
  readonly showDetails = signal(false);
  readonly requestStateCode: Signal<string> = computed(() => String(this.request()?.stateCode));

  readonly currentLanguage = computed(() => this.i18nService.lang());
  readonly requestId = computed(() => this.request()?.id ?? '');
  readonly formattedRequestDate = computed(() => formatDate(this.request()?.requestDate));
  readonly formattedLastStateChangeDate = computed(() =>
    formatDate(this.request()?.lastStateChangeDate),
  );
  readonly dataConsumerName = computed(
    () => this.request()?.dataRequest?.dataConsumerDisplayName ?? null,
  );
  readonly requestConsumerLogo = computed(
    () => this.request()?.dataRequest?.dataConsumerLogoBase64 ?? null,
  );

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
    this.dataRequestProducts
      ?.value()
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

  readonly showDetailsEffect = effect(() => {
    const request = this.request();
    if (request) {
      this.showDetails.set(true);
    } else {
      this.showDetails.set(false);
    }
  });

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
    try {
      await this.consentRequestService.updateConsentRequestStatus(id, stateCode);
      this.consentRequestService.fetchConsentRequests.reload();
      this.handleCloseDetails();
    } catch (error) {
      console.error('Error updating consent request status:', error);
    }
  }
}
