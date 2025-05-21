import { Component, computed, Input, signal } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faChevronUp, faChevronDown } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-agridata-accordion',
  imports: [FontAwesomeModule],
  templateUrl: './agridata-accordion.component.html',
  styleUrl: './agridata-accordion.component.css',
})
export class AgridataAccordionComponent {
  readonly isExpanded = signal<boolean>(false);
  readonly expandIcon = computed(() => (this.isExpanded() ? faChevronUp : faChevronDown));

  @Input() header: string = '';
  @Input() content: string = '';

  toggleAccordion() {
    this.isExpanded.set(!this.isExpanded());
  }
}
