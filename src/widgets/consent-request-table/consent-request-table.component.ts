import { Component, Input, Signal, computed, inject, input, signal } from '@angular/core';
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
import { ToastService, ToastType } from '@/shared/toast';
import {
  ActionDTO,
  AgridataTableComponent,
  AgridataTableData,
  CellTemplateDirective,
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

  // binds to the route parameter :consentRequestId
  readonly consentRequestId = input<string>();
  readonly consentRequests = input.required<ConsentRequestDto[]>();
  @Input() tableRowAction!: (request: ConsentRequestDto) => void;
  @Input() reloadConsentRequests!: () => void;

  readonly fileIcon = faFile;
  readonly eyeIcon = faEye;
  readonly checkIcon = faCheck;
  readonly banIcon = faBan;
  readonly BadgeSize = BadgeSize;
  readonly BadgeVariant = BadgeVariant;

  readonly stateFilter = signal<string | null>(null);
  readonly requests: Signal<AgridataTableData[]> = computed(() => {
    const filter = this.stateFilter();
    return this.consentRequests()
      .filter((request) => !filter || request.stateCode === filter)
      .map((request: ConsentRequestDto) => ({
        id: request.id,
        data: [
          { header: 'Antragsteller', value: request.dataRequest?.dataConsumer?.name ?? '' },
          { header: 'Datenantrag', value: request.dataRequest?.titleDe ?? '' },
          {
            header: 'Antragsdatum',
            value: request.requestDate ?? '',
          },
          { header: 'Status', value: request.stateCode ?? '' },
        ],
        highlighted: request.stateCode === ConsentRequestStateEnum.Opened,
        actions: this.getFilteredActions(request),
        rowAction: () => this.tableRowAction(request),
      }));
  });

  getCellValue(row: AgridataTableData, header: string) {
    const cell = row.data.find((c) => c.header === header);
    return cell ? cell.value : '';
  }

  getFilteredActions = (request?: ConsentRequestDto): ActionDTO[] => {
    if (!request) return [];
    const requestTitle = request.dataRequest?.titleDe;
    const details = {
      icon: this.eyeIcon,
      label: 'Details',
      callback: () => this.tableRowAction(request),
    };

    const consent = {
      icon: this.checkIcon,
      label: 'Einwilligen',
      callback: () =>
        this.updateConsentRequestState(request.id, ConsentRequestStateEnum.Granted, requestTitle),
      isMainAction: request.stateCode === ConsentRequestStateEnum.Opened,
    };

    const decline = {
      icon: this.banIcon,
      label: 'Ablehnen',
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

  setStateFilter(state: string | null) {
    this.stateFilter.set(state);
  }

  updateConsentRequestState = async (id: string, stateCode: string, requestName?: string) => {
    this.consentRequestService
      .updateConsentRequestStatus(id, stateCode)
      .then(() => {
        const toastTitle = getToastTitle(stateCode);
        const toastMessage = getToastMessage(stateCode, requestName);
        const toastType = getToastType(stateCode);
        const undoAction = this.prepareUndoAction(id);
        this.toastService.show(toastTitle, toastMessage, toastType, undoAction);
        this.reloadConsentRequests();
      })
      .catch((error) => {
        console.log(error.error);
        this.toastService.show(
          error.error.message,
          `Fehler beim Aktualisieren des Antrags. RequestId: ${error.error.requestId}`,
          ToastType.Error,
        );
      });
  };

  prepareUndoAction(id: string) {
    const previousStateCode = this.consentRequests().find((r) => r.id === id)?.stateCode;
    return getUndoAction(() => {
      this.toastService.show(getToastTitle(''), 'Die Aktion wurde erfolgreich rückgängig gemacht.');
      this.consentRequestService.updateConsentRequestStatus(id, previousStateCode!).then(() => {
        this.reloadConsentRequests();
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
