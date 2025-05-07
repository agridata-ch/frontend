import { Component, computed, Injectable, Resource, Signal, signal } from '@angular/core';
import { ConsentRequestService } from './consent-request.service';
import { ConsentRequest } from '@/app/shared/openapi/model/models';
import {
  AgridataTableComponent,
  CellTemplateDirective,
} from '@/app/shared/components/agridata-table/agridata-table.component';
import { ActionDTO } from '@/app/shared/components/agridata-table/table-actions/table-actions.component';
import { ConsentRequestFilterComponent } from './consent-request-filter/consent-request-filter.component';

type DynamicRow = Record<string, unknown>;

@Injectable({ providedIn: 'root' })
@Component({
  selector: 'app-consent-request',
  imports: [ConsentRequestFilterComponent, AgridataTableComponent, CellTemplateDirective],
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
  readonly requests: Signal<DynamicRow[]> = computed(() => {
    const filter = this.stateFilter();
    return this.consentRequestResult
      .value()
      .filter((r) => (filter.length ? filter.includes(r.state!) : true))
      .map((request: ConsentRequest) => ({
        Antragsteller: request.dataProducerUid,
        Datenantrag: request.dataRequest?.descriptionDe,
        Antragsdatum: this.dateFormatter.format(new Date(request.requestDate ?? '')),
        Status: request.state,
      }));
  });
  readonly actions = signal<ActionDTO[]>([
    {
      label: 'Einwilligen',
      callback: () => {},
      isMainAction: true,
    },
    {
      label: 'Ablehnen',
      callback: () => {},
    },
  ]);

  ngOnInit() {
    this.consentRequestResult.reload();
  }

  setStateFilter(state: (string | null)[]) {
    this.stateFilter.set(state);
  }
}
