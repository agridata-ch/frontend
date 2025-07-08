import { Component, Signal, computed, inject, input, output, signal } from '@angular/core';
import { faEye, faFile } from '@fortawesome/free-regular-svg-icons';
import { faBan, faCheck } from '@fortawesome/free-solid-svg-icons';

import { ConsentRequestService } from '@/entities/api';
import { ConsentRequestDto, ConsentRequestStateEnum } from '@/entities/openapi';
import {
  getToastMessage,
  getToastTitle,
  getToastType,
  getUndoAction,
} from '@/shared/consent-request';
import { I18nService } from '@/shared/i18n/i18n.service';
import { ToastService, ToastType } from '@/shared/toast';
import {
  ActionDTO,
  AgridataTableComponent,
  AgridataTableData,
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
  ],
  templateUrl: './consent-request-table.component.html',
})
export class ConsentRequestTableComponent {
  private readonly toastService = inject(ToastService);
  private readonly consentRequestService = inject(ConsentRequestService);
  private readonly i18nService = inject(I18nService);

  // binds to the route parameter :consentRequestId
  readonly consentRequestId = input<string>();
  readonly consentRequests = input.required<ConsentRequestDto[]>();
  readonly tableRowAction = output<ConsentRequestDto>();
  readonly onReloadConsentRequests = output<void>();

  readonly fileIcon = faFile;
  readonly eyeIcon = faEye;
  readonly checkIcon = faCheck;
  readonly banIcon = faBan;
  readonly BadgeSize = BadgeSize;
  readonly BadgeVariant = BadgeVariant;
  readonly SortDirections = SortDirections;

  readonly dataRequestTitleHeader = 'consent-request-table.dataRequest.title';
  readonly dataRequestStateHeader = 'consent-request-table.dataRequest.state.title';

  readonly stateCodeFilter = signal<string | null>(null);
  readonly requests: Signal<AgridataTableData[]> = computed(() => {
    const filter = this.stateCodeFilter();
    return this.consentRequests()
      .filter((request) => !filter || request.stateCode === filter)
      .map((request: ConsentRequestDto) => ({
        id: request.id,
        data: [
          {
            header: 'consent-request-table.dataRequest.consumerName',
            value: request.dataRequest?.dataConsumerDisplayName ?? '',
          },
          {
            header: this.dataRequestTitleHeader,
            value: this.i18nService.useObjectTranslation(request.dataRequest?.title),
          },
          {
            header: 'consent-request-table.dataRequest.date',
            value: request.requestDate ?? '',
          },
          { header: this.dataRequestStateHeader, value: request.stateCode ?? '' },
        ],
        highlighted: request.stateCode === ConsentRequestStateEnum.Opened,
        actions: this.getFilteredActions(request),
        rowAction: () => this.tableRowAction.emit(request),
      }));
  });

  getCellValue(row: AgridataTableData, header: string) {
    const cell = row.data.find((c) => c.header === header);
    return cell ? cell.value : '';
  }

  getTranslatedStateValue(row: AgridataTableData, header: string) {
    const value = this.getCellValue(row, header);
    return this.i18nService.translate(`consent-request-table.dataRequest.state.${value}`);
  }

  getFilteredActions = (request?: ConsentRequestDto): ActionDTO[] => {
    if (!request) return [];
    const requestTitle = this.i18nService.useObjectTranslation(request.dataRequest?.title);
    const details = {
      icon: this.eyeIcon,
      label: 'consent-request-table.tableActions.details',
      callback: () => this.tableRowAction.emit(request),
    };

    const consent = {
      icon: this.checkIcon,
      label: 'consent-request-table.tableActions.consent',
      callback: () =>
        this.updateConsentRequestState(request.id, ConsentRequestStateEnum.Granted, requestTitle),
      isMainAction: request.stateCode === ConsentRequestStateEnum.Opened,
    };

    const decline = {
      icon: this.banIcon,
      label: 'consent-request-table.tableActions.decline',
      callback: () =>
        this.updateConsentRequestState(request.id, ConsentRequestStateEnum.Declined, requestTitle),
    };

    switch (request.stateCode) {
      case ConsentRequestStateEnum.Opened:
        return [details, consent, decline];
      case ConsentRequestStateEnum.Declined:
        return [details, consent];
      case ConsentRequestStateEnum.Granted:
        return [details, decline];
      default:
        return [];
    }
  };

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
        this.onReloadConsentRequests.emit();
      })
      .catch((error) => {
        const errorMessage = this.i18nService.translate('consent-request-table.error', {
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
        this.onReloadConsentRequests.emit();
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
