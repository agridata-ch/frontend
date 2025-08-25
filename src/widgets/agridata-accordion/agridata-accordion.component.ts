import { Component, computed, input, signal } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons';

/**
 * Implements the accordion logic and behavior. It manages expansion state, toggles open/closed on
 * click or keyboard input, and updates the displayed icon accordingly.
 *
 * CommentLastReviewed: 2025-08-25
 */
@Component({
  selector: 'app-agridata-accordion',
  imports: [FontAwesomeModule],
  templateUrl: './agridata-accordion.component.html',
})
export class AgridataAccordionComponent {
  readonly isExpanded = signal<boolean>(false);
  readonly expandIcon = computed(() => (this.isExpanded() ? faChevronUp : faChevronDown));
  readonly header = input<string>('');

  toggleAccordion() {
    this.isExpanded.set(!this.isExpanded());
  }
}
