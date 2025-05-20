import { Component, computed, Resource, Signal, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConsentRequestService } from '@pages/consent-request-producer/api/consent-request.service';
import { ConsentRequestDto } from '@/shared/api/openapi/model/models';
import {
  AgridataTableComponent,
  AgridataTableData,
  CellTemplateDirective,
} from '@widgets/agridata-table/agridata-table.component';
import { ActionDTO } from '@widgets/agridata-table/table-actions/table-actions.component';
import { ConsentRequestFilterComponent } from './consent-request-filter/consent-request-filter.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faFile } from '@fortawesome/free-regular-svg-icons';

@Component({
  selector: 'app-consent-request-producer-page',
  imports: [
    CommonModule,
    ConsentRequestFilterComponent,
    AgridataTableComponent,
    CellTemplateDirective,
    FontAwesomeModule,
  ],
  templateUrl: './consent-request-producer.page.html',
  styleUrl: './consent-request-producer.page.css',
})
export class ConsentRequestProducerPage {
  constructor(private readonly consentRequestService: ConsentRequestService) {
    this.consentRequestResult = this.consentRequestService.consentRequests;
  }

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
      .filter((request) => !filter || request.state === filter)
      .map((request: ConsentRequestDto) => ({
        data: [
          { header: 'Antragsteller', value: request.dataRequest?.dataConsumer?.name ?? '' },
          { header: 'Datenantrag', value: request.dataRequest?.descriptionDe ?? '' },
          {
            header: 'Antragsdatum',
            value: request.requestDate ?? '',
          },
          { header: 'Status', value: request.state ?? '' },
        ],
        highlighted: request.state === 'OPENED',
        actions: this.getFilteredActions(request.state),
      }));
  });
  readonly totalOpenRequests: Signal<number> = computed(() => {
    return this.consentRequestResult.value().filter((r) => r.state === 'OPENED').length;
  });

  getFilteredActions = (state?: string): ActionDTO[] => {
    const details = {
      label: 'Details',
      callback: () => console.log('Details clicked'),
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

    switch (state) {
      case 'OPENED':
        return [details, consent, decline];
      case 'DECLINED':
      case 'GRANTED':
        return [details, withdraw];
      default:
        return [details, consent, decline, withdraw];
    }
  };

  ngOnInit() {
    this.consentRequestResult.reload();
  }

  setStateFilter(state: string | null) {
    this.stateFilter.set(state);
  }

  getCellValue(row: AgridataTableData, header: string): string {
    const cell = row.data.find((c) => c.header === header);
    return cell ? cell.value : '';
  }
}
