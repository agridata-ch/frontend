import { Component, Input, computed, signal } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-agridata-accordion',
  imports: [FontAwesomeModule],
  templateUrl: './agridata-accordion.component.html',
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
