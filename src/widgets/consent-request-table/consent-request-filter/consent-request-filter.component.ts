import { Component, EventEmitter, Output, computed, input, signal } from '@angular/core';

import { ConsentRequestDto, ConsentRequestStateEnum } from '@/entities/openapi';

@Component({
  selector: 'app-consent-request-filter',
  imports: [],
  templateUrl: './consent-request-filter.component.html',
  styleUrl: './consent-request-filter.component.css',
})
export class ConsentRequestFilterComponent {
  readonly requests = input.required<ConsentRequestDto[]>();
  @Output() onClick = new EventEmitter<string | null>();

  readonly requestsSignal = signal<ConsentRequestDto[]>([]);

  readonly consentRequestStateEnum = ConsentRequestStateEnum;
  readonly filterOptions = [
    { label: 'Alle', value: null },
    { label: 'Offen', value: this.consentRequestStateEnum.Opened },
    { label: 'Abgelehnt', value: this.consentRequestStateEnum.Declined },
    { label: 'Genehmigt', value: this.consentRequestStateEnum.Granted },
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
