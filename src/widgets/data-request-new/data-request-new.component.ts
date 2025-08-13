import { CommonModule } from '@angular/common';
import { Component, ViewChild, computed, effect, inject, input, signal } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faArrowLeft, faArrowRight } from '@fortawesome/free-solid-svg-icons';

import DataRequestDtoSchema from '@/assets/formSchemas/DataRequestUpdateDto.json';
import { DataRequestService } from '@/entities/api';
import {
  ConsentRequestDetailViewDtoDataRequestStateCode,
  DataRequestDto,
} from '@/entities/openapi';
import { I18nDirective, I18nService } from '@/shared/i18n';
import { Dto, buildReactiveForm, flattenFormGroup } from '@/shared/lib/form.helper';
import { ToastService, ToastType } from '@/shared/toast';
import { ButtonComponent, ButtonVariants } from '@/shared/ui/button';
import { AgridataWizardComponent } from '@/widgets/agridata-wizard';
import {
  DataRequestFormConsumerComponent,
  DataRequestFormProducerComponent,
  DataRequestFormRequestComponent,
} from '@/widgets/data-request-form';
import { FORM_GROUP_NAMES } from '@/widgets/data-request-new';
import { DataRequestPreviewComponent } from '@/widgets/data-request-preview';

@Component({
  selector: 'app-data-request-new',
  imports: [
    I18nDirective,
    ButtonComponent,
    FontAwesomeModule,
    AgridataWizardComponent,
    ReactiveFormsModule,
    CommonModule,
    DataRequestFormRequestComponent,
    DataRequestPreviewComponent,
    DataRequestFormConsumerComponent,
    DataRequestFormProducerComponent,
  ],
  templateUrl: './data-request-new.component.html',
})
export class DataRequestNewComponent {
  readonly i18nService = inject(I18nService);
  readonly dataRequestService = inject(DataRequestService);
  readonly toastService = inject(ToastService);

  readonly selectedRequest = input<DataRequestDto | null>(null);

  readonly dataRequestId = signal<string>(this.selectedRequest()?.id ?? '');
  readonly dataRequest = signal<DataRequestDto | null>(this.selectedRequest());

  readonly ButtonVariants = ButtonVariants;
  readonly ToastType = ToastType;
  readonly nextIcon = faArrowRight;
  readonly previousIcon = faArrowLeft;
  readonly FORM_GROUP_NAMES = FORM_GROUP_NAMES;

  @ViewChild(AgridataWizardComponent)
  readonly wizard!: AgridataWizardComponent;

  readonly consumerLabel = this.i18nService.translateSignal('data-request.wizard.steps.consumer');
  readonly requestLabel = this.i18nService.translateSignal('data-request.wizard.steps.request');
  readonly previewLabel = this.i18nService.translateSignal('data-request.wizard.steps.preview');
  readonly producerLabel = this.i18nService.translateSignal('data-request.wizard.steps.producer');
  readonly contractLabel = this.i18nService.translateSignal('data-request.wizard.steps.contract');
  readonly completionLabel = this.i18nService.translateSignal(
    'data-request.wizard.steps.completion',
  );

  readonly titlePlaceholderDe = this.i18nService.translateSignal(
    'data-request.form.request.title.de.placeholder',
  );
  readonly titlePlaceholderFr = this.i18nService.translateSignal(
    'data-request.form.request.title.fr.placeholder',
  );
  readonly titlePlaceholderIt = this.i18nService.translateSignal(
    'data-request.form.request.title.it.placeholder',
  );
  readonly descriptionPlaceholderDe = this.i18nService.translateSignal(
    'data-request.form.request.description.de.placeholder',
  );
  readonly descriptionPlaceholderFr = this.i18nService.translateSignal(
    'data-request.form.request.description.fr.placeholder',
  );
  readonly descriptionPlaceholderIt = this.i18nService.translateSignal(
    'data-request.form.request.description.it.placeholder',
  );
  readonly purposePlaceholderDe = this.i18nService.translateSignal(
    'data-request.form.request.purpose.de.placeholder',
  );
  readonly purposePlaceholderFr = this.i18nService.translateSignal(
    'data-request.form.request.purpose.fr.placeholder',
  );
  readonly purposePlaceholderIt = this.i18nService.translateSignal(
    'data-request.form.request.purpose.it.placeholder',
  );

  readonly formMap = signal([
    {
      formGroupName: FORM_GROUP_NAMES.CONSUMER,
      fields: [
        'dataConsumerDisplayName',
        'dataConsumerCity',
        'dataConsumerZip',
        'dataConsumerStreet',
        'dataConsumerCountry',
        'contactPhoneNumber',
        'contactEmailAddress',
      ],
    },
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
    { formGroupName: FORM_GROUP_NAMES.PRODUCER, fields: ['targetGroup'] },
    { formGroupName: FORM_GROUP_NAMES.CONTRACT, fields: [] },
    { formGroupName: FORM_GROUP_NAMES.COMPLETION, fields: [] },
  ]);
  readonly logoFile = signal<File | null>(null);

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
      case FORM_GROUP_NAMES.CONSUMER:
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

  readonly initialValues = computed(() => ({
    title: {
      de: this.titlePlaceholderDe(),
      fr: this.titlePlaceholderFr(),
      it: this.titlePlaceholderIt(),
    },
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

  readonly initialData = computed(() => {
    return this.selectedRequest() || this.initialValues();
  });

  readonly formDisabled = computed(() => {
    const request = this.selectedRequest() || this.dataRequest();
    return (
      !!request?.stateCode &&
      request.stateCode !== ConsentRequestDetailViewDtoDataRequestStateCode.Draft
    );
  });

  readonly form = computed(() => {
    // Create the form with the current initialData
    const newForm = buildReactiveForm(
      DataRequestDtoSchema,
      this.formMap(),
      this.i18nService,
      this.initialData() as Dto,
    );

    // Set up form event handlers
    this.formMap().forEach(({ formGroupName }) => {
      const fg = newForm.get(formGroupName) as unknown as FormGroup;
      fg.statusChanges.subscribe(() => {
        this.updateFormSteps(formGroupName, fg.valid);
      });
    });

    return newForm;
  });

  formDisabledEffect = effect(() => {
    const disabled = this.formDisabled();
    const form = this.form();

    if (form) {
      form.disable({ emitEvent: false });
      if (!disabled) {
        form.enable({ emitEvent: false });
      }
    }
  });

  selectedRequestEffect = effect(() => {
    const selected = this.selectedRequest();

    if (selected) {
      // Since initialData is a computed based on selectedRequest,
      // the form will automatically be rebuilt by the computed signal
      this.dataRequestId.set(selected.id ?? '');
      this.dataRequest.set(selected);
      this.updateFormSteps();
    }
  });

  handleStepChange() {
    if (!this.formDisabled()) this.handleSave();
  }

  handlePreviousStep() {
    if (!this.formDisabled()) this.handleSave();
    this.wizard.previousStep();
  }

  handleNextStep() {
    if (!this.formDisabled()) this.handleSave();
    this.wizard.nextStep();
  }

  async handleSave() {
    if (this.formDisabled()) return;

    const id = this.wizard.currentStepId();
    const form = this.form();
    form.get(id)?.markAllAsTouched();
    this.updateFormSteps(id, form.get(id)?.valid ?? false);
    await this.createOrSaveDataRequest();
  }

  async handleSubmitAndContinue() {
    this.handleSave().then(async () => {
      const form = this.form();
      form.markAllAsTouched();
      this.updateFormSteps();
      if (form.valid) {
        await this.dataRequestService
          .submitDataRequest(this.dataRequestId())
          .then((dataRequest: DataRequestDto) => {
            this.dataRequest.set(dataRequest);
            this.wizard.nextStep();
          })
          .catch((error) => {
            console.error('Error submitting data request:', error);
            const errorMessage = this.i18nService.translate('data-request.submit.error');
            this.toastService.show(error.message, errorMessage, ToastType.Error);
          });
      } else {
        console.error('Form is invalid, cannot submit data request');
      }
    });
  }

  handleSaveAndComplete() {
    const form = this.form();
    form.markAllAsTouched();
    if (form.invalid) {
      console.error('Form is invalid, cannot save data request');
      return;
    }
  }

  async createOrSaveDataRequest() {
    const form = this.form();
    const flattenForm = flattenFormGroup(form);

    if (this.dataRequestId()) {
      if (this.logoFile()) {
        await this.dataRequestService
          .uploadLogo(this.dataRequestId(), this.logoFile()!)
          .then(() => {
            this.logoFile.set(null);
          });
      }
      await this.dataRequestService
        .updateDataRequestDetails(this.dataRequestId(), flattenForm)
        .then((dataRequest: DataRequestDto) => {
          this.dataRequest.set(dataRequest);
        });
    } else {
      await this.dataRequestService
        .createDataRequest(flattenForm)
        .then(async (dataRequest: DataRequestDto) => {
          this.dataRequestId.set(dataRequest.id!);
          this.dataRequest.set(dataRequest);
          if (this.logoFile()) {
            await this.dataRequestService
              .uploadLogo(this.dataRequestId(), this.logoFile()!)
              .then(() => {
                this.logoFile.set(null);
              });
          }
        });
    }
  }

  updateFormSteps(id?: string, valid?: boolean) {
    this.formControlSteps.update((steps) =>
      steps.map((step) => {
        if (id && step.id !== id) {
          return step;
        }

        const form = this.form();
        const formGroup = form.get(step.id) as unknown as FormGroup;

        if (formGroup.disabled) {
          return {
            ...step,
            isValid: true,
          };
        }

        // Update the validity state of the form group
        const isValid = valid ?? formGroup?.valid;

        return {
          ...step,
          isValid,
        };
      }),
    );
  }

  handleSaveLogo(logo: File) {
    this.logoFile.set(logo);

    if (this.dataRequestId()) {
      this.dataRequestService.uploadLogo(this.dataRequestId(), logo).then(() => {
        this.logoFile.set(null);
      });
    }
  }
}
