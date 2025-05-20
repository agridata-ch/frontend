import { Component, EventEmitter, Input, Output, signal } from '@angular/core';

@Component({
  selector: 'app-consent-request-filter',
  imports: [],
  templateUrl: './consent-request-filter.component.html',
  styleUrl: './consent-request-filter.component.css',
})
export class ConsentRequestFilterComponent {
  @Input() indicatorValue: number | null = null;
  @Output() onClick = new EventEmitter<string | null>();

  readonly filterOptions = [
    { label: 'Alle', value: null },
    { label: 'Offen', value: 'OPENED' },
    { label: 'Abgelehnt', value: 'DECLINED' },
    { label: 'Genehmigt', value: 'GRANTED' },
  ];
  readonly selectedValue = signal<string | null>(null);

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
