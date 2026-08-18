import { Component, computed, input, output, signal } from '@angular/core';

import {
  ConsentRequestAggregationSummaryDto,
  ConsentRequestAggregationStateEnum,
} from '@/entities/openapi';
import { isOpenAggregationState } from '@/shared/consent-request';
import { I18nPipe } from '@/shared/i18n';
import { ButtonComponent, ButtonVariants } from '@/shared/ui/button';

/**
 * Implements filter logic for consent request states. It tracks selected filters, emits filter
 * changes, and calculates totals for open requests.
 *
 * CommentLastReviewed: 2025-09-02
 */
@Component({
  selector: 'app-consent-request-filter',
  imports: [I18nPipe, ButtonComponent],
  templateUrl: './consent-request-filter.component.html',
})
export class ConsentRequestFilterComponent {
  readonly requests = input.required<ConsentRequestAggregationSummaryDto[]>();
  handleFilterChange = output<string | null>();

  readonly ButtonVariants = ButtonVariants;

  readonly filterOptions = [
    { label: 'consent-request.filter.ALL', value: null },
    {
      // combined filter, the table matches PARTIALLY_OPENED on this value as well
      label: 'consent-request.filter.OPENED',
      value: ConsentRequestAggregationStateEnum.Opened,
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
  ];
  readonly selectedValue = signal<string | null>(null);
  readonly isOpenAggregationState = isOpenAggregationState;

  /** Counter shown on the OPENED filter button, the only one that carries a count. */
  readonly totalOpenRequests = computed(
    () => this.requests().filter((request) => isOpenAggregationState(request.stateCode)).length,
  );

  handleClick(value: string | null) {
    if (this.selectedValue() === value) {
      value = null;
    }
    this.selectedValue.set(value);
    this.handleFilterChange.emit(value);
  }

  isSelected(value: string | null): boolean {
    return this.selectedValue() === value;
  }
}
