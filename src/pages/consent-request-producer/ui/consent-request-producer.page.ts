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
import { CommonModule, Location } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faFile, faEye } from '@fortawesome/free-regular-svg-icons';
import { faBan, faCheck } from '@fortawesome/free-solid-svg-icons';

import { ConsentRequestService } from '@shared/services/consent-request.service';
import { ConsentRequestDto, ConsentRequestStateEnum } from '@shared/api/openapi/model/models';
import { ToastService, ToastType } from '@shared/services/toast.service';
import {
  AgridataTableComponent,
  AgridataTableData,
  CellTemplateDirective,
} from '@widgets/agridata-table/agridata-table.component';
import { ActionDTO } from '@widgets/agridata-table/table-actions/table-actions.component';
import { ConsentRequestDetailsComponent } from '@widgets/consent-request-details/consent-request-details.component';

import { ConsentRequestFilterComponent } from './consent-request-filter/consent-request-filter.component';
import { RequestStateBadgeComponent } from '@features/request-state-badge/request-state-badge.component';

export function getToastTitle(stateCode: string): string {
  switch (stateCode) {
    case ConsentRequestStateEnum.Granted:
      return 'Einwilligung erteilt';
    case ConsentRequestStateEnum.Declined:
      return 'Einwilligung abgelehnt';
    default:
      return 'Antrag aktualisiert';
  }
}

export function getToastMessage(stateCode: string, requestName?: string): string {
  switch (stateCode) {
    case ConsentRequestStateEnum.Granted:
      return `Du hast den Antrag ${requestName ?? ''} erfolgreich eingewilligt.`;
    case ConsentRequestStateEnum.Declined:
      return `Du hast den Antrag ${requestName ?? ''} erfolgreich abgelehnt.`;
    default:
      return 'Der Antrag wurde aktualisiert.';
  }
}

export function getToastType(stateCode: string): ToastType {
  switch (stateCode) {
    case ConsentRequestStateEnum.Granted:
      return ToastType.Success;
    case ConsentRequestStateEnum.Declined:
      return ToastType.Error;
    default:
      return ToastType.Info;
  }
}

@Component({
  selector: 'app-consent-request-producer-page',
  imports: [
    CommonModule,
    FontAwesomeModule,
    CellTemplateDirective,
    ConsentRequestFilterComponent,
    AgridataTableComponent,
    ConsentRequestDetailsComponent,
    RequestStateBadgeComponent,
  ],
  templateUrl: './consent-request-producer.page.html',
  styleUrl: './consent-request-producer.page.css',
})
export class ConsentRequestProducerPage {
  private readonly browserLocation = inject(Location);
  private readonly toastService = inject(ToastService);

  // binds to the route parameter :consentRequestId
  readonly consentRequestId = input<string>();

  readonly fileIcon = faFile;
  readonly eyeIcon = faEye;
  readonly checkIcon = faCheck;
  readonly banIcon = faBan;
  readonly stateFilter = signal<string | null>(null);
  readonly consentRequestResult = resource<ConsentRequestDto[], unknown>({
    loader: async () => this.consentRequestService.fetchConsentRequests(),
    defaultValue: [],
  });
  readonly requests: Signal<AgridataTableData[]> = computed(() => {
    const filter = this.stateFilter();
    return this.consentRequestResult
      .value()
      .filter((request) => !filter || request.stateCode === filter)
      .map((request: ConsentRequestDto) => ({
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
        rowAction: this.showConsentRequestDetails.bind(this, request),
      }));
  });
  readonly totalOpenRequests: Signal<number> = computed(() => {
    return this.consentRequestResult
      .value()
      .filter((r) => r.stateCode === ConsentRequestStateEnum.Opened).length;
  });
  readonly selectedRequest = signal<ConsentRequestDto | null>(null);

  constructor(private readonly consentRequestService: ConsentRequestService) {
    // effect to open the details view if we visit the page with a consentRequestId in the URL directly
    effect(() => {
      this.handleOpenDetails();
    });
  }

  handleOpenDetails = () => {
    if (this.consentRequestResult.isLoading() || !this.consentRequestId()) return;

    const request = this.consentRequestResult
      .value()
      .find((request) => request.id === this.consentRequestId());

    this.showConsentRequestDetails(request, false);
  };

  getFilteredActions = (request?: ConsentRequestDto): ActionDTO[] => {
    if (!request) return [];
    const requestTitle = request.dataRequest?.titleDe;
    const details = {
      icon: this.eyeIcon,
      label: 'Details',
      callback: () => this.showConsentRequestDetails(request),
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

  getCellValue(row: AgridataTableData, header: string): string {
    const cell = row.data.find((c) => c.header === header);
    return cell ? cell.value : '';
  }

  setStateFilter(state: string | null) {
    this.stateFilter.set(state);
  }

  showConsentRequestDetails = (request?: ConsentRequestDto, pushUrl: boolean = true) => {
    this.selectedRequest.set(request ?? null);

    // update the URL without triggering the router so the transition animation works
    if (pushUrl) {
      this.browserLocation.go(`/consent-requests/${request?.id ?? ''}`);
    }
  };

  updateConsentRequestState = async (id: string, stateCode: string, requestName?: string) => {
    this.consentRequestService
      .updateConsentRequestStatus(id, stateCode)
      .then(() => {
        const toastTitle = getToastTitle(stateCode);
        const toastMessage = getToastMessage(stateCode, requestName);
        const toastType = getToastType(stateCode);
        this.toastService.show(toastTitle, toastMessage, toastType);
        this.consentRequestResult.reload();
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
}
