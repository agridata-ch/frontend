import { Component, computed, input, output, signal } from '@angular/core';

import { ConsentRequestProducerViewDto, ConsentRequestStateEnum } from '@/entities/openapi';
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
  readonly requests = input.required<ConsentRequestProducerViewDto[]>();
  onClick = output<string | null>();

  readonly requestsSignal = signal<ConsentRequestProducerViewDto[]>([]);
  readonly ButtonVariants = ButtonVariants;

  readonly consentRequestStateEnum = ConsentRequestStateEnum;
  readonly filterOptions = [
    { label: 'consent-request.filter.ALL', value: null },
    {
      label: 'consent-request.filter.OPENED',
      value: this.consentRequestStateEnum.Opened,
    },
    {
      label: 'consent-request.filter.DECLINED',
      value: this.consentRequestStateEnum.Declined,
    },
    {
      label: 'consent-request.filter.GRANTED',
      value: this.consentRequestStateEnum.Granted,
    },
  ];
  readonly selectedValue = signal<string | null>(null);
  readonly totalOpenRequests = computed(() => {
    return this.requests().filter(
      (request) => request.stateCode === this.consentRequestStateEnum.Opened,
    ).length;
  });

  handleClick(value: string | null) {
    if (this.selectedValue() === value) {
      value = null;
    }
    this.selectedValue.set(value);
    this.onClick.emit(value);
  }

  isSelected(value: string | null): boolean {
    return this.selectedValue() === value;
  }
}
