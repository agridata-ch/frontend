import { Component, computed, Injectable, Resource, Signal, signal } from '@angular/core';
import { ConsentRequestService } from './consent-request.service';
import { ConsentRequest } from '@/app/shared/openapi/model/models';
import {
  AgridataTableComponent,
  AgridataTableData,
  CellTemplateDirective,
} from '@/app/shared/components/agridata-table/agridata-table.component';
import { ActionDTO } from '@/app/shared/components/agridata-table/table-actions/table-actions.component';
import { ConsentRequestFilterComponent } from './consent-request-filter/consent-request-filter.component';
import { CommonModule } from '@angular/common';

@Injectable({ providedIn: 'root' })
@Component({
  selector: 'app-consent-request',
  imports: [
    ConsentRequestFilterComponent,
    AgridataTableComponent,
    CellTemplateDirective,
    CommonModule,
  ],
  templateUrl: './consent-request.component.html',
  styleUrl: './consent-request.component.css',
})
export class ConsentRequestComponent {
  constructor(private readonly consentRequestService: ConsentRequestService) {
    this.consentRequestResult = this.consentRequestService.consentRequests;
  }

  readonly consentRequestResult!: Resource<ConsentRequest[]>;
  readonly dateFormatter = Intl.DateTimeFormat('de-DE', {
    dateStyle: 'medium',
  });
  readonly stateFilter = signal<(string | null)[]>([]);
  readonly requests: Signal<AgridataTableData[]> = computed(() => {
    const filter = this.stateFilter();
    return this.consentRequestResult
      .value()
      .filter((r) => !filter.length || filter.includes(r.state!))
      .map((req: ConsentRequest) => ({
        data: [
          { header: 'Antragsteller', value: req.dataProducerUid ?? '' },
          { header: 'Datenantrag', value: req.dataRequest?.descriptionDe ?? '' },
          {
            header: 'Antragsdatum',
            value: req.requestDate ? this.dateFormatter.format(new Date(req.requestDate)) : '',
          },
          { header: 'Status', value: req.state ?? '' },
        ],
        highlighted: req.state === 'OPENED',
        actions: this.getFilteredActions(req.state),
      }));
  });

  private getFilteredActions = (state: string | undefined): ActionDTO[] => {
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

  setStateFilter(state: (string | null)[]) {
    this.stateFilter.set(state);
  }

  getCellValue(row: AgridataTableData, header: string): string {
    const cell = row.data.find((c) => c.header === header);
    return cell ? cell.value : '';
  }
}
