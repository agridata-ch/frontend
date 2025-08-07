import { Component, Signal, computed, inject, input, output, signal } from '@angular/core';
import { faBan, faCheck } from '@fortawesome/free-solid-svg-icons';

import { ConsentRequestService } from '@/entities/api';
import { ConsentRequestProducerViewDto, ConsentRequestStateEnum } from '@/entities/openapi';
import {
  getToastMessage,
  getToastTitle,
  getToastType,
  getUndoAction,
} from '@/shared/consent-request';
import { I18nService } from '@/shared/i18n/i18n.service';
import { ToastService, ToastType } from '@/shared/toast';
import { AgridataAvatarComponent, AvatarSize, AvatarSkin } from '@/shared/ui/agridata-avatar';
import {
  ActionDTO,
  AgridataTableComponent,
  AgridataTableData,
  AgridataTableUtils,
  CellTemplateDirective,
  SortDirections,
} from '@/shared/ui/agridata-table';
import { AgridataBadgeComponent, BadgeSize, BadgeVariant } from '@/shared/ui/badge';
import { ConsentRequestFilterComponent } from '@/widgets/consent-request-table/consent-request-filter/consent-request-filter.component';

@Component({
  selector: 'app-consent-request-table',
  imports: [
    ConsentRequestFilterComponent,
    AgridataTableComponent,
    AgridataBadgeComponent,
    CellTemplateDirective,
    AgridataAvatarComponent,
  ],
  templateUrl: './consent-request-table.component.html',
})
export class ConsentRequestTableComponent {
  private readonly toastService = inject(ToastService);
  private readonly consentRequestService = inject(ConsentRequestService);
  private readonly i18nService = inject(I18nService);

  // binds to the route parameter :consentRequestId
  readonly consentRequestId = input<string>();
  readonly consentRequests = input.required<ConsentRequestProducerViewDto[]>();
  readonly tableRowAction = output<ConsentRequestProducerViewDto>();

  protected readonly checkIcon = faCheck;
  protected readonly banIcon = faBan;
  protected readonly BadgeSize = BadgeSize;
  protected readonly BadgeVariant = BadgeVariant;
  protected readonly SortDirections = SortDirections;
  protected readonly AvatarSize = AvatarSize;
  protected readonly AvatarSkin = AvatarSkin;
  protected readonly getCellValue = AgridataTableUtils.getCellValue;

  protected readonly dataRequestTitleHeader = 'consent-request.dataRequest.title';
  protected readonly dataRequestStateHeader = 'consent-request.dataRequest.state';
  protected readonly dataRequestConsumerHeader = 'consent-request.dataRequest.consumerName';

  protected readonly stateCodeFilter = signal<string | null>(null);
  protected readonly requests: Signal<AgridataTableData[]> = computed(() => {
    const filter = this.stateCodeFilter();
    return this.consentRequests()
      .filter((request) => !filter || request.stateCode === filter)
      .map((request: ConsentRequestProducerViewDto) => ({
        id: request.id,
        data: [
          {
            header: this.dataRequestConsumerHeader,
            value: request.dataRequest?.dataConsumerDisplayName ?? '',
          },
          {
            header: this.dataRequestTitleHeader,
            value: this.i18nService.useObjectTranslation(request.dataRequest?.title),
          },
          {
            header: 'consent-request.dataRequest.date',
            value: request.requestDate ?? '',
          },
          { header: this.dataRequestStateHeader, value: request.stateCode ?? '' },
        ],
        highlighted: request.stateCode === ConsentRequestStateEnum.Opened,
        actions: this.getFilteredActions(request),
        rowAction: () => this.tableRowAction.emit(request),
      }));
  });

  getTranslatedStateValue(row: AgridataTableData, header: string) {
    const value = this.getCellValue(row, header);
    return this.i18nService.translate(`consent-request.dataRequest.stateCode.${value}`);
  }

  getFilteredActions = (request?: ConsentRequestProducerViewDto): ActionDTO[] => {
    if (!request) return [];
    const requestTitle = this.i18nService.useObjectTranslation(request.dataRequest?.title);

    const consent = {
      icon: this.checkIcon,
      label: 'consent-request.table.tableActions.consent',
      callback: () =>
        this.updateConsentRequestState(request.id, ConsentRequestStateEnum.Granted, requestTitle),
      isMainAction: true,
    };

    return request.stateCode === ConsentRequestStateEnum.Opened ? [consent] : [];
  };

  getConsumerLogo(row: AgridataTableData) {
    return (
      this.consentRequests().find((request) => request.id === row.id)?.dataRequest
        ?.dataConsumerLogoBase64 ?? null
    );
  }

  setStateCodeFilter(state: string | null) {
    this.stateCodeFilter.set(state);
  }

  updateConsentRequestState = async (id: string, stateCode: string, requestName?: string) => {
    this.consentRequestService
      .updateConsentRequestStatus(id, stateCode)
      .then(() => {
        const toastTitle = this.i18nService.translate(getToastTitle(stateCode), {
          name: requestName,
        });
        const toastMessage = this.i18nService.translate(getToastMessage(stateCode), {
          name: requestName,
        });
        const toastType = getToastType(stateCode);
        const undoAction = this.prepareUndoAction(id);
        this.toastService.show(toastTitle, toastMessage, toastType, undoAction);
        this.consentRequestService.fetchConsentRequests.reload();
      })
      .catch((error) => {
        const errorMessage = this.i18nService.translate('consent-request.table.error', {
          requestId: error.error?.requestId ?? '',
        });
        console.log(error.error);
        this.toastService.show(error.error.message, errorMessage, ToastType.Error);
      });
  };

  prepareUndoAction(id: string) {
    const previousStateCode = this.consentRequests().find(
      (request) => request.id === id,
    )?.stateCode;
    return getUndoAction(() => {
      this.toastService.show(this.i18nService.translate(getToastTitle('')), '');
      this.consentRequestService.updateConsentRequestStatus(id, previousStateCode!).then(() => {
        this.consentRequestService.fetchConsentRequests.reload();
      });
    });
  }

  getBadgeVariant = (stateCode: string) => {
    if (stateCode === ConsentRequestStateEnum.Opened) return BadgeVariant.INFO;
    if (stateCode === ConsentRequestStateEnum.Granted) return BadgeVariant.SUCCESS;
    if (stateCode === ConsentRequestStateEnum.Declined) return BadgeVariant.ERROR;
    return BadgeVariant.DEFAULT;
  };
}
