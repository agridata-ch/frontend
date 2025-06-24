import { Component, effect, input, output, signal } from '@angular/core';

import { WizardStep } from '@/widgets/agridata-wizard/';
import { AgridataWizardStepperComponent } from '@/widgets/agridata-wizard/agridata-wizard-stepper/agridata-wizard-stepper.component';

@Component({
  selector: 'app-agridata-wizard',
  imports: [AgridataWizardStepperComponent],
  templateUrl: './agridata-wizard.component.html',
})
export class AgridataWizardComponent {
  steps = input<WizardStep[]>([]);
  currentStep = signal(0);
  currentStepId = signal<string>('');
  onStepChange = output<void>();

  constructor() {
    effect(() => {
      this.updateStepId();
    });
  }

  private updateStepId() {
    this.currentStepId.set(this.steps()[this.currentStep()].id);
  }

  nextStep() {
    if (this.currentStep() < this.steps().length - 1) {
      this.currentStep.update((step) => step + 1);
    }
    this.updateStepId();
  }

  previousStep() {
    if (this.currentStep() > 0) {
      this.currentStep.update((step) => step - 1);
    }
    this.updateStepId();
  }

  handleChangeStep(stepIndex: number) {
    if (stepIndex >= 0 && stepIndex < this.steps().length) {
      this.onStepChange.emit();
      this.currentStep.set(stepIndex);
      this.updateStepId();
    }
  }
}
