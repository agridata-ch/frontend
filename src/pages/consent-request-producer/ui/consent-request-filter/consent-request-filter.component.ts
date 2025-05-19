import { Component, EventEmitter, Input, Output, signal } from '@angular/core';

@Component({
  selector: 'app-consent-request-filter',
  imports: [],
  templateUrl: './consent-request-filter.component.html',
  styleUrl: './consent-request-filter.component.css',
})
export class ConsentRequestFilterComponent {
  @Input() indicatorValue: number | null = null;
  @Output() onClick = new EventEmitter<(string | null)[]>();

  readonly filterOptions = [
    { label: 'Alle', value: null },
    { label: 'Offen', value: 'OPENED' },
    { label: 'Abgelehnt', value: 'DECLINED' },
    { label: 'Genehmigt', value: 'GRANTED' },
  ];
  readonly selectedValues = signal<(string | null)[]>([]);

  handleClick(value: string | null) {
    let newValues = [...this.selectedValues()];
    if (value === null) {
      newValues = [];
    } else if (newValues.includes(value)) {
      newValues = newValues.filter((v) => v !== value);
    } else {
      newValues.push(value);
    }

    if (newValues.length === this.selectedValues().length) {
      return;
    }

    this.selectedValues.set(newValues);
    this.onClick.emit(newValues);
  }

  isSelected(value: string | null): boolean {
    if (value === null) {
      return this.selectedValues().length === 0;
    }
    return this.selectedValues().includes(value);
  }
}
