import { Component, EventEmitter, Output, computed, input, signal } from '@angular/core';

import { ConsentRequestDto, ConsentRequestStateEnum } from '@/entities/openapi';
import { I18nPipe } from '@/shared/i18n';

@Component({
  selector: 'app-consent-request-filter',
  imports: [I18nPipe],
  templateUrl: './consent-request-filter.component.html',
  styleUrl: './consent-request-filter.component.css',
})
export class ConsentRequestFilterComponent {
  readonly requests = input.required<ConsentRequestDto[]>();
  @Output() onClick = new EventEmitter<string | null>();

  readonly requestsSignal = signal<ConsentRequestDto[]>([]);

  readonly consentRequestStateEnum = ConsentRequestStateEnum;
  readonly filterOptions = [
    { label: 'consent-request-table.filter.ALL', value: null },
    {
      label: 'consent-request-table.filter.OPENED',
      value: this.consentRequestStateEnum.Opened,
    },
    {
      label: 'consent-request-table.filter.DECLINED',
      value: this.consentRequestStateEnum.Declined,
    },
    {
      label: 'consent-request-table.filter.GRANTED',
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
