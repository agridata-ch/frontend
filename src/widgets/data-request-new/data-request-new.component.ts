import { CommonModule } from '@angular/common';
import { Component, ViewChild, computed, inject, signal } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faArrowLeft, faArrowRight } from '@fortawesome/free-solid-svg-icons';

import DataRequestDtoSchema from '@/assets/formSchemas/DataRequestUpdateDto.json';
import { DataRequestService } from '@/entities/api';
import { DataRequestDto, DataRequestUpdateDto } from '@/entities/openapi';
import { I18nPipe, I18nService } from '@/shared/i18n';
import { Dto, buildReactiveForm, flattenFormGroup } from '@/shared/lib/form.helper';
import { ButtonComponent, ButtonVariants } from '@/shared/ui/button';
import { AgridataWizardComponent } from '@/widgets/agridata-wizard';
import { DataRequestFormRequestComponent } from '@/widgets/data-request-form';
import { FORM_GROUP_NAMES } from '@/widgets/data-request-new';

@Component({
  selector: 'app-data-request-new',
  imports: [
    I18nPipe,
    ButtonComponent,
    FontAwesomeModule,
    I18nPipe,
    AgridataWizardComponent,
    ReactiveFormsModule,
    CommonModule,
    DataRequestFormRequestComponent,
  ],
  templateUrl: './data-request-new.component.html',
})
export class DataRequestNewComponent {
  readonly i18nService = inject(I18nService);
  readonly dataRequestService = inject(DataRequestService);
  readonly dataRequestId = signal<string>('');
  readonly ButtonVariants = ButtonVariants;
  readonly nextIcon = faArrowRight;
  readonly previousIcon = faArrowLeft;
  readonly FORM_GROUP_NAMES = FORM_GROUP_NAMES;

  @ViewChild(AgridataWizardComponent)
  readonly wizard!: AgridataWizardComponent;

  readonly consumerLabel = this.i18nService.translateSignal('data-request-new.steps.consumer');
  readonly requestLabel = this.i18nService.translateSignal('data-request-new.steps.request');
  readonly previewLabel = this.i18nService.translateSignal('data-request-new.steps.preview');
  readonly producerLabel = this.i18nService.translateSignal('data-request-new.steps.producer');
  readonly contractLabel = this.i18nService.translateSignal('data-request-new.steps.contract');
  readonly completionLabel = this.i18nService.translateSignal('data-request-new.steps.completion');

  readonly descriptionPlaceholderDe = this.i18nService.translateSignal(
    'data-request-new.form.request.description.de.placeholder',
  );
  readonly descriptionPlaceholderFr = this.i18nService.translateSignal(
    'data-request-new.form.request.description.fr.placeholder',
  );
  readonly descriptionPlaceholderIt = this.i18nService.translateSignal(
    'data-request-new.form.request.description.it.placeholder',
  );
  readonly purposePlaceholderDe = this.i18nService.translateSignal(
    'data-request-new.form.request.purpose.de.placeholder',
  );
  readonly purposePlaceholderFr = this.i18nService.translateSignal(
    'data-request-new.form.request.purpose.fr.placeholder',
  );
  readonly purposePlaceholderIt = this.i18nService.translateSignal(
    'data-request-new.form.request.purpose.it.placeholder',
  );

  readonly formMap = signal([
    { formGroupName: FORM_GROUP_NAMES.DATA_CONSUMER, fields: [] },
    {
      formGroupName: FORM_GROUP_NAMES.REQUEST,
      fields: [
        'products',
        'title.de',
        'title.fr',
        'title.it',
        'description.de',
        'description.fr',
        'description.it',
        'purpose.de',
        'purpose.fr',
        'purpose.it',
      ],
    },
    { formGroupName: FORM_GROUP_NAMES.PREVIEW, fields: [] },
    { formGroupName: FORM_GROUP_NAMES.PRODUCER, fields: [] },
    { formGroupName: FORM_GROUP_NAMES.CONTRACT, fields: [] },
    { formGroupName: FORM_GROUP_NAMES.COMPLETION, fields: [] },
  ]);

  readonly initialFormControlSteps = computed(() =>
    this.formMap().map((step) => ({
      id: step.formGroupName,
      label: this.getStepLabelSignal(step.formGroupName),
      isValid: true,
    })),
  );

  readonly formControlSteps = signal(this.initialFormControlSteps());

  private getStepLabelSignal(formGroupName: string) {
    switch (formGroupName) {
      case FORM_GROUP_NAMES.DATA_CONSUMER:
        return this.consumerLabel();
      case FORM_GROUP_NAMES.REQUEST:
        return this.requestLabel();
      case FORM_GROUP_NAMES.PREVIEW:
        return this.previewLabel();
      case FORM_GROUP_NAMES.PRODUCER:
        return this.producerLabel();
      case FORM_GROUP_NAMES.CONTRACT:
        return this.contractLabel();
      case FORM_GROUP_NAMES.COMPLETION:
        return this.completionLabel();
    }
  }

  readonly dtoFromBE = {} as DataRequestUpdateDto;

  readonly initialValues = computed(() => ({
    description: {
      de: this.descriptionPlaceholderDe(),
      fr: this.descriptionPlaceholderFr(),
      it: this.descriptionPlaceholderIt(),
    },
    purpose: {
      de: this.purposePlaceholderDe(),
      fr: this.purposePlaceholderFr(),
      it: this.purposePlaceholderIt(),
    },
  }));

  readonly initialData = computed(() =>
    Object.keys(this.dtoFromBE).length ? (this.dtoFromBE as Dto) : (this.initialValues() as Dto),
  );

  readonly form = buildReactiveForm(
    DataRequestDtoSchema,
    this.formMap(),
    this.i18nService,
    this.initialData(),
  );

  constructor() {
    if (Object.keys(this.dtoFromBE).length) {
      this.updateFormSteps();
    }
    this.formMap().forEach(({ formGroupName }) => {
      const fg = this.form.get(formGroupName) as unknown as FormGroup;
      fg.statusChanges.subscribe(() => {
        this.updateFormSteps(formGroupName, fg.valid);
      });
    });
  }

  handleStepChange() {
    this.handleSave(this.wizard.currentStepId());
  }

  handleSave(id: string, nextStep: boolean = false) {
    this.form.get(id)?.markAllAsTouched();
    this.updateFormSteps(id, this.form.get(id)?.valid ?? false);
    this.createOrSaveDataRequest();

    if (nextStep) {
      this.wizard.nextStep();
    }
  }

  handleSaveAndComplete() {
    this.form.markAllAsTouched();
    this.updateFormSteps();
    if (this.form.invalid) {
      console.error('Form is invalid, cannot save data request');
      return;
    }
    console.log('Data request saved and completed');
  }

  createOrSaveDataRequest() {
    const flattenForm = flattenFormGroup(this.form) as DataRequestUpdateDto;

    if (this.dataRequestId()) {
      this.dataRequestService.updateDataRequestDraft(this.dataRequestId(), flattenForm);
    } else {
      this.dataRequestService.createDataRequest(flattenForm).then((dataRequest: DataRequestDto) => {
        this.dataRequestId.set(dataRequest.id!);
      });
    }
  }

  updateFormSteps(id?: string, valid?: boolean) {
    this.formControlSteps.update((steps) =>
      steps.map((step) => {
        if (id && step.id !== id) {
          return step;
        }

        const formGroup = this.form.get(step.id) as unknown as FormGroup;

        // Update the validity state of the form group
        const isValid = valid ?? formGroup?.valid;

        return {
          ...step,
          isValid,
        };
      }),
    );
  }
}
