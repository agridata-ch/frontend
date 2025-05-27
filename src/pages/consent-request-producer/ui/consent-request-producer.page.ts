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
import { faFile } from '@fortawesome/free-regular-svg-icons';

import { ConsentRequestService } from '@pages/consent-request-producer/api/consent-request.service';
import { ConsentRequestDto } from '@/shared/api/openapi/model/models';
import {
  AgridataTableComponent,
  AgridataTableData,
  CellTemplateDirective,
} from '@widgets/agridata-table/agridata-table.component';
import { ActionDTO } from '@widgets/agridata-table/table-actions/table-actions.component';
import { ConsentRequestDetailsComponent } from '@/widgets/consent-request-details/consent-request-details.component';

import { ConsentRequestFilterComponent } from './consent-request-filter/consent-request-filter.component';

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

  // binds to the route parameter :consentRequestId
  readonly consentRequestId = input<string>();

  readonly fileIcon = faFile;
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
          { header: 'Datenantrag', value: request.dataRequest?.descriptionDe ?? '' },
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
      if (this.consentRequestResult.isLoading() || !this.consentRequestId()) return;

      const request = this.consentRequestResult
        .value()
        .find((request) => request.id === this.consentRequestId());

      this.showConsentRequestDetails(request, false);
    });
  }

  ngOnInit() {
    this.consentRequestResult.reload();
  }

  getFilteredActions = (request: ConsentRequestDto): ActionDTO[] => {
    const details = {
      label: 'Details',
      callback: () => this.showConsentRequestDetails(request),
    };

    const consent = {
      label: 'Einwilligen',
      callback: () => console.log('Einwilligen clicked'),
      isMainAction: true,
    };

    const decline = {
      label: 'Ablehnen',
      callback: () => console.log('Ablehnen clicked'),
    };

    const withdraw = {
      label: 'Zurückziehen',
      callback: () => console.log('Zurückziehen clicked'),
    };

    switch (request.stateCode) {
      case 'OPENED':
        return [details, consent, decline];
      case 'DECLINED':
      case 'GRANTED':
        return [details, withdraw];
      default:
        return [details, consent, decline, withdraw];
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
}
