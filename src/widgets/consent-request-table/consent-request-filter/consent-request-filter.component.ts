import { Component, computed, input, output } from '@angular/core';

import {
  ConsentRequestAggregationSummaryDto,
  ConsentRequestAggregationStateEnum,
} from '@/entities/openapi';
import { isOpenAggregationState } from '@/shared/consent-request';
import { FilterButtonsComponent, FilterOption } from '@/shared/ui/filter-buttons';

/**
 * Implements filter logic for consent request states. It emits filter changes and calculates
 * totals for open requests.
 *
 * CommentLastReviewed: 2026-10-29
 */
@Component({
  selector: 'app-consent-request-filter',
  imports: [FilterButtonsComponent],
  templateUrl: './consent-request-filter.component.html',
})
export class ConsentRequestFilterComponent {
  readonly requests = input.required<ConsentRequestAggregationSummaryDto[]>();
  readonly handleFilterChange = output<string | null>();

  /** Counter shown on the OPENED filter button, the only one that carries a count. */
  private readonly totalOpenRequests = computed(
    () => this.requests().filter((request) => isOpenAggregationState(request.stateCode)).length,
  );
  protected readonly filterOptions = computed<FilterOption[]>(() => [
    { label: 'consent-request.filter.ALL', value: null },
    {
      // combined filter, the table matches PARTIALLY_OPENED on this value as well
      label: 'consent-request.filter.OPENED',
      value: ConsentRequestAggregationStateEnum.Opened,
      count: this.totalOpenRequests(),
    },
    {
      label: 'consent-request.filter.DECLINED',
      value: ConsentRequestAggregationStateEnum.Declined,
    },
    {
      label: 'consent-request.filter.GRANTED',
      value: ConsentRequestAggregationStateEnum.Granted,
    },
    {
      label: 'consent-request.filter.PARTIALLY_GRANTED',
      value: ConsentRequestAggregationStateEnum.PartiallyGranted,
    },
  ]);
}
