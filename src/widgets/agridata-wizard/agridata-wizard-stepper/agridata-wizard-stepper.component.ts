import { Component, input, output } from '@angular/core';

import { WizardStep } from '@/widgets/agridata-wizard';

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
