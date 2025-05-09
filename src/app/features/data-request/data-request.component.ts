import { Component, computed, Injectable, Resource, signal } from '@angular/core';
import { DataRequestService } from './data-request.service';
import { ConsentRequest } from '@/app/shared/openapi/model/models';
import { ChipComponent } from '../../shared/components/chip/chip.component';
import {
  AgridataTableComponent,
  CellTemplateDirective,
} from '@/app/shared/components/agridata-table/agridata-table.component';

@Injectable({ providedIn: 'root' })
@Component({
  selector: 'app-data-request',
  imports: [ChipComponent, AgridataTableComponent, CellTemplateDirective],
  templateUrl: './data-request.component.html',
  styleUrl: './data-request.component.css',
})
export class DataRequestComponent {
  constructor(private readonly dataRequestService: DataRequestService) {
    this.dataRequestResult = this.dataRequestService.dataRequests;
  }

  readonly dataRequestResult!: Resource<ConsentRequest[]>;
  readonly dateFormatter = Intl.DateTimeFormat('de-DE', {
    dateStyle: 'medium',
  });
  readonly stateFilter = signal<string | null>(null);

  readonly requests = computed(() => {
    const filter = this.stateFilter();
    console.log(filter);
    return this.dataRequestResult
      .value()
      .filter((r) => (filter ? r.state === filter : true))
      .map((request: ConsentRequest) => ({
        Antragsteller: request.dataRequest?.dataConsumerBur,
        Datenantrag: request.dataRequest?.descriptionDe,
        Antragsdatum: this.dateFormatter.format(new Date(request.requestDate ?? '')),
        Status: request.state,
      }));
  });

  ngOnInit() {
    this.dataRequestResult.reload();
  }

  setStateFilter(state: string | null) {
    console.log('state', state);
    if (state === 'ALL') {
      state = null;
    }
    this.stateFilter.set(state);
  }
}
