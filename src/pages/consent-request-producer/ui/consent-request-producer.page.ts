import {
  Component,
  computed,
  effect,
  inject,
  input,
  Resource,
  Signal,
  signal,
} from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faFile, faEye } from '@fortawesome/free-regular-svg-icons';
import { faBan, faCheck } from '@fortawesome/free-solid-svg-icons';

import { ConsentRequestService } from '@shared/services/consent-request.service';
import { ConsentRequestDto } from '@shared/api/openapi/model/models';
import { ToastService, ToastType } from '@shared/services/toast.service';
import {
  AgridataTableComponent,
  AgridataTableData,
  CellTemplateDirective,
} from '@widgets/agridata-table/agridata-table.component';
import { ActionDTO } from '@widgets/agridata-table/table-actions/table-actions.component';
import { ConsentRequestDetailsComponent } from '@widgets/consent-request-details/consent-request-details.component';

import { ConsentRequestFilterComponent } from './consent-request-filter/consent-request-filter.component';

export function getToastTitle(stateCode: string): string {
  switch (stateCode) {
    case 'GRANTED':
      return 'Einwilligung erteilt';
    case 'DECLINED':
      return 'Einwilligung abgelehnt';
    default:
      return 'Antrag aktualisiert';
  }
}

export function getToastMessage(stateCode: string, requestName?: string): string {
  switch (stateCode) {
    case 'GRANTED':
      return `Du hast den Antrag ${requestName ?? ''} erfolgreich eingewilligt.`;
    case 'DECLINED':
      return `Du hast den Antrag ${requestName ?? ''} erfolgreich abgelehnt.`;
    default:
      return 'Der Antrag wurde aktualisiert.';
  }
}

export function getToastType(stateCode: string): ToastType {
  switch (stateCode) {
    case 'GRANTED':
      return ToastType.Success;
    case 'DECLINED':
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
  readonly consentRequestResult!: Resource<ConsentRequestDto[]>;
  readonly dateFormatter = Intl.DateTimeFormat('de-DE', {
    dateStyle: 'medium',
  });
  readonly stateFilter = signal<string | null>(null);
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
        highlighted: request.stateCode === 'OPENED',
        actions: this.getFilteredActions(request),
        rowAction: this.showConsentRequestDetails.bind(this, request),
      }));
  });
  readonly totalOpenRequests: Signal<number> = computed(() => {
    return this.consentRequestResult.value().filter((r) => r.stateCode === 'OPENED').length;
  });
  readonly selectedRequest = signal<ConsentRequestDto | null>(null);

  constructor(private readonly consentRequestService: ConsentRequestService) {
    this.consentRequestResult = this.consentRequestService.consentRequests;

    // effect to open the details view if we visit the page with a consentRequestId in the URL directly
    effect(() => {
      this.handleOpenDetails();
    });
  }

  ngOnInit() {
    this.consentRequestResult.reload();
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
    const dataConsumerName = request.dataRequest?.dataConsumer?.name;
    const details = {
      icon: this.eyeIcon,
      label: 'Details',
      callback: () => this.showConsentRequestDetails(request),
    };

    const consent = {
      icon: this.checkIcon,
      label: 'Einwilligen',
      callback: () => this.updateConsentRequestState(request.id, 'GRANTED', dataConsumerName),
      isMainAction: request.stateCode === 'OPENED',
    };

    const decline = {
      icon: this.banIcon,
      label: 'Ablehnen',
      callback: () => this.updateConsentRequestState(request.id, 'DECLINED', dataConsumerName),
    };

    switch (request.stateCode) {
      case 'OPENED':
        return [details, consent, decline];
      case 'DECLINED':
        return [details, consent];
      case 'GRANTED':
        return [details, decline];
      default:
        return [];
    }
  };

  getCellValue(row: AgridataTableData, header: string): string {
    const cell = row.data.find((c) => c.header === header);
    return cell ? cell.value : '';
  }

  getStateClasses(stateCode: string): string {
    switch (stateCode) {
      case 'OPENED':
        return 'bg-cyan-100 text-cyan-700';
      case 'GRANTED':
        return 'bg-green-100 text-green-700';
      case 'DECLINED':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-800';
    }
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
