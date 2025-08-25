import { Component, input, output } from '@angular/core';

import { WizardStep } from '@/widgets/agridata-wizard';

/**
 * Implements the stepper UI for the wizard. It renders each step as a clickable bubble with
 * styling for active, completed, and invalid states. It emits events when the user clicks a step.
 *
 * CommentLastReviewed: 2025-08-25
 */
@Component({
  selector: 'app-agridata-wizard-stepper',
  imports: [],
  templateUrl: './agridata-wizard-stepper.component.html',
  styleUrl: './agridata-wizard-stepper.component.css',
})
export class AgridataWizardStepperComponent {
  steps = input<WizardStep[]>([]);
  currentStep = input<number>(0);
  onStepChange = output<number>();

  handleClickStep($index: number) {
    this.onStepChange.emit($index);
  }
}
