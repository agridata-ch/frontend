import {
  Component,
  DOCUMENT,
  effect,
  ElementRef,
  inject,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';

import { WizardStep } from '@/widgets/agridata-wizard/';
import { AgridataWizardStepperComponent } from '@/widgets/agridata-wizard/agridata-wizard-stepper/agridata-wizard-stepper.component';

/**
 * Implements the wizard container logic. It manages the current step index, synchronizes step
 * identifiers, and provides methods to navigate forward, backward, or directly to a chosen step.
 * It integrates the stepper component and emits events on step changes.
 *
 * CommentLastReviewed: 2025-08-25
 */
@Component({
  selector: 'app-agridata-wizard',
  imports: [AgridataWizardStepperComponent],
  templateUrl: './agridata-wizard.component.html',
})
export class AgridataWizardComponent {
  // Injects
  private readonly document = inject(DOCUMENT);

  // Inputs
  steps = input<WizardStep[]>([]);

  // Signals
  currentStep = signal(0);
  currentStepId = signal<string>('');

  // Outputs
  handleStepChange = output<void>();

  // Effects
  private readonly stepIdEffect = effect(() => {
    this.updateStepId();
  });

  private readonly scrollContainer = viewChild<ElementRef<HTMLDivElement>>('scrollContainer');

  handleChangeStep(stepIndex: number) {
    if (stepIndex >= 0 && stepIndex < this.steps().length) {
      this.handleStepChange.emit();
      this.currentStep.set(stepIndex);
      this.updateStepId();
    }
  }

  nextStep() {
    if (this.currentStep() < this.steps().length - 1) {
      this.currentStep.update((step) => step + 1);
    }
    this.updateStepId();
    this.scrollToTop();
  }

  previousStep() {
    if (this.currentStep() > 0) {
      this.currentStep.update((step) => step - 1);
    }
    this.updateStepId();
    this.scrollToTop();
  }

  private updateStepId() {
    this.currentStepId.set(this.steps()[this.currentStep()].id);
  }

  private scrollToTop(): void {
    const el = this.scrollContainer()?.nativeElement;
    if (el) {
      el.scrollTop = 0;
    }
  }
}
