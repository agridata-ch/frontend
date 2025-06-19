import { Component, computed, inject, signal } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faArrowLeft, faArrowRight, faPlus } from '@fortawesome/free-solid-svg-icons';

import { I18nPipe, I18nService } from '@/shared/i18n';
import { SidepanelComponent } from '@/shared/sidepanel';
import { ButtonComponent, ButtonVariants } from '@/shared/ui/button';
import { AgridataWizardComponent } from '@/widgets/agridata-wizard';

@Component({
  selector: 'app-data-request-new',
  imports: [
    SidepanelComponent,
    I18nPipe,
    ButtonComponent,
    FontAwesomeModule,
    I18nPipe,
    AgridataWizardComponent,
  ],
  templateUrl: './data-request-new.component.html',
  styleUrl: './data-request-new.component.css',
})
export class DataRequestNewComponent {
  readonly i18nService = inject(I18nService);
  readonly showPanel = signal<boolean>(false);
  readonly ButtonVariants = ButtonVariants;
  readonly buttonIcon = faPlus;
  readonly nextIcon = faArrowRight;
  readonly previousIcon = faArrowLeft;

  readonly consumerLabel = this.i18nService.translateSignal('data-request-new.steps.consumer');
  readonly dataRequestLabel = this.i18nService.translateSignal(
    'data-request-new.steps.dataRequest',
  );
  readonly previewLabel = this.i18nService.translateSignal('data-request-new.steps.preview');
  readonly producerLabel = this.i18nService.translateSignal('data-request-new.steps.producer');
  readonly contractLabel = this.i18nService.translateSignal('data-request-new.steps.contract');
  readonly completionLabel = this.i18nService.translateSignal('data-request-new.steps.completion');

  readonly formControlSteps = computed(() => [
    { id: 'consumer', label: this.consumerLabel(), isValid: true },
    { id: 'dataRequest', label: this.dataRequestLabel(), isValid: true },
    { id: 'preview', label: this.previewLabel(), isValid: true },
    { id: 'producer', label: this.producerLabel(), isValid: true },
    { id: 'contract', label: this.contractLabel(), isValid: true },
    { id: 'completion', label: this.completionLabel(), isValid: true },
  ]);

  handleOpen() {
    this.showPanel.set(true);
  }

  handleClose() {
    this.showPanel.set(false);
  }

  handleSave() {
    // Logic to save the data request
    console.log('Data request saved');
  }

  handleSaveAndComplete() {
    // Logic to save and complete the data request
    console.log('Data request saved and completed');
  }
}
