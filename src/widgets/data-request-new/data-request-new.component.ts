import { CommonModule } from '@angular/common';
import {
  Component,
  computed,
  DestroyRef,
  effect,
  inject,
  input,
  resource,
  signal,
  ViewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { faArrowLeft, faArrowRight } from '@awesome.me/kit-0b6d1ed528/icons/classic/regular';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { debounceTime } from 'rxjs';

import { ErrorHandlerService } from '@/app/error/error-handler.service';
import { DataRequestUpdateDto } from '@/assets/formSchemas/agridata-schemas.json';
import { DataRequestService } from '@/entities/api';
import { DataRequestDto } from '@/entities/openapi';
import { ConsentRequestDetailViewDtoDataRequestStateCode } from '@/entities/openapi/model/consentRequestDetailViewDtoDataRequestStateCode';
import { FORCE_RELOAD_DATA_REQUESTS_STATE_PARAM } from '@/pages/data-requests-consumer';
import { ROUTE_PATHS } from '@/shared/constants/constants';
import { ErrorOutletComponent } from '@/shared/error-alert-outlet/error-outlet.component';
import { I18nDirective, I18nService } from '@/shared/i18n';
import {
  createResourceErrorHandlerEffect,
  createResourceValueComputed,
} from '@/shared/lib/api.helper';
import {
  buildReactiveForm,
  Dto,
  flattenFormGroup,
  populateFormFromDto,
} from '@/shared/lib/form.helper';
import { SidepanelComponent } from '@/shared/sidepanel';
import { ToastService, ToastType } from '@/shared/toast';
import { ButtonComponent, ButtonVariants } from '@/shared/ui/button';
import { AgridataWizardComponent, WizardStep } from '@/widgets/agridata-wizard';
import {
  DataRequestFormConsumerComponent,
  DataRequestFormProducerComponent,
  DataRequestFormRequestComponent,
} from '@/widgets/data-request-form';
import { FORM_COMPLETION_STRATEGIES, FORM_GROUP_NAMES } from '@/widgets/data-request-new';
import { DataRequestPreviewComponent } from '@/widgets/data-request-preview';

export const DATA_REQUEST_NEW_ID = 'new';

/**
 * Implements the wizard-driven data request creation flow. It manages multiple form groups,
 * synchronizes validation states, handles saving and submission, and integrates services for
 * persistence, logo uploads, and translations. It ensures smooth navigation across steps and
 * manages draft, submission, and completion logic.
 *
 * CommentLastReviewed: 2025-08-25
 */
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
    ErrorOutletComponent,
    SidepanelComponent,
  ],
  templateUrl: './data-request-new.component.html',
})
export class DataRequestNewComponent {
  private readonly i18nService = inject(I18nService);
  private readonly dataRequestService = inject(DataRequestService);
  private readonly toastService = inject(ToastService);
  private readonly router = inject(Router);
  private readonly errorService = inject(ErrorHandlerService);
  private readonly destroyRef = inject(DestroyRef);
  // set from route param
  readonly dataRequestId = input<string | undefined>();
  // writable signal used if data request is created
  readonly currentDataRequestId = signal<string | undefined>(undefined);
  readonly refreshListNeeded = signal(false);

  protected readonly dataRequestsResource = resource({
    params: () => ({ id: this.dataRequestId() }),
    loader: ({ params }) => {
      if (!params?.id || params.id === DATA_REQUEST_NEW_ID) {
        return Promise.resolve(undefined);
      }
      return this.dataRequestService.fetchDataRequest(params.id);
    },
  });

  // initial data request from resource
  readonly initialRequest = createResourceValueComputed(this.dataRequestsResource);
  private readonly errorHandlerEffect = createResourceErrorHandlerEffect(
    this.dataRequestsResource,
    this.errorService,
  );
  // contains current data request state
  readonly dataRequest = signal<DataRequestDto | undefined>(undefined);

  private readonly updateDataRequestFromRessourceEffect = effect(() => {
    const request = this.initialRequest();
    this.dataRequest.set(request);
    populateFormFromDto(this.form, request as unknown as Record<string, unknown>, this.formMap);
    if (request?.id) {
      this.updateFormSteps();
    }
  });

  private readonly updateDataRequestIdFromRouteEffect = effect(() => {
    if (this.dataRequestId() !== DATA_REQUEST_NEW_ID) {
      this.currentDataRequestId.set(this.dataRequestId());
    }
  });

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

  readonly formMap = [
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
      completionStrategy: FORM_COMPLETION_STRATEGIES.FORM_VALIDATION,
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
      completionStrategy: FORM_COMPLETION_STRATEGIES.FORM_VALIDATION,
    },
    {
      formGroupName: FORM_GROUP_NAMES.PREVIEW,
      fields: [],
      completionStrategy: FORM_COMPLETION_STRATEGIES.ALWAYS_COMPLETE,
    },
    {
      formGroupName: FORM_GROUP_NAMES.PRODUCER,
      fields: ['targetGroup'],
      completionStrategy: FORM_COMPLETION_STRATEGIES.FORM_VALIDATION,
    },
    {
      formGroupName: FORM_GROUP_NAMES.CONTRACT,
      fields: [],
      completionStrategy: FORM_COMPLETION_STRATEGIES.EXTERNAL_DEPENDENCY,
    },
    // TODO: Re-enable these steps when their implementation is ready DIGIB2-542
    // {
    //   formGroupName: FORM_GROUP_NAMES.COMPLETION,
    //   fields: [],
    //   completionStrategy: FORM_COMPLETION_STRATEGIES.EXTERNAL_DEPENDENCY,
    // },
  ];
  readonly logoFile = signal<File | null>(null);

  readonly formControlSteps = signal<WizardStep[]>(
    this.formMap.map((step) => ({
      id: step.formGroupName,
      label: this.getStepLabelSignal(step.formGroupName),
      isValid: true,
      completed: false,
    })),
  );

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

  readonly defaultValues = computed(() => ({
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

  readonly formDisabled = computed(() => {
    const request = this.dataRequest();
    return (
      !!request?.stateCode &&
      request.stateCode !== ConsentRequestDetailViewDtoDataRequestStateCode.Draft
    );
  });

  readonly form = this.createForm();
  private createForm() {
    // Create the form with the current initialData
    const newForm = buildReactiveForm(
      DataRequestUpdateDto,
      this.formMap,
      this.i18nService,
      this.defaultValues() as Dto,
    );

    // Set up form event handlers
    this.formMap.forEach(({ formGroupName }) => {
      const fg = newForm.get(formGroupName) as unknown as FormGroup;
      fg.statusChanges
        .pipe(takeUntilDestroyed(this.destroyRef), debounceTime(400))
        .subscribe(() => {
          if (fg.dirty) {
            this.updateFormSteps(formGroupName, fg.valid);
          }
        });
    });

    return newForm;
  }

  formGroupDisabledEffect = effect(() => {
    const disabled = this.formDisabled();
    const form = this.form;
    form.updateValueAndValidity();

    // disable every form group where controls are available
    if (form && disabled) {
      form.disable({ emitEvent: false });
      this.formMap.forEach(({ formGroupName }) => {
        const fg = form.get(formGroupName) as unknown as FormGroup;
        if (fg && Object.keys(fg.controls).length > 0) {
          fg.disable({ emitEvent: false });
        }
      });
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
    const form = this.form;
    form.get(id)?.markAllAsTouched();
    this.updateFormSteps(id, form.get(id)?.valid ?? false);
    await this.createOrSaveDataRequest();
  }

  async handleSubmitAndContinue() {
    this.handleSave().then(async () => {
      const form = this.form;
      form.markAllAsTouched();
      this.updateFormSteps();
      const dataRequestId = this.currentDataRequestId();
      if (form.valid && dataRequestId) {
        await this.dataRequestService
          .submitDataRequest(dataRequestId)
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
  // @Todo this doesn't do anyting will be extended with DIGIB2-308
  handleSaveAndComplete() {
    const form = this.form;
    form.markAllAsTouched();
    if (form.invalid) {
      console.error('Form is invalid, cannot save data request');
      return;
    }
  }

  async createOrSaveDataRequest() {
    this.refreshListNeeded.set(true);
    const form = this.form;
    const flattenForm = flattenFormGroup(form);
    const dataRequestId = this.currentDataRequestId();
    if (dataRequestId) {
      if (this.logoFile()) {
        await this.dataRequestService.uploadLogo(dataRequestId, this.logoFile()!).then(() => {
          this.logoFile.set(null);
        });
      }
      await this.dataRequestService
        .updateDataRequestDetails(dataRequestId, flattenForm)
        .then((dataRequest: DataRequestDto) => {
          this.dataRequest.set(dataRequest);
        });
    } else {
      await this.dataRequestService
        .createDataRequest(flattenForm)
        .then(async (dataRequest: DataRequestDto) => {
          this.currentDataRequestId.set(dataRequest.id);
          this.dataRequest.set(dataRequest);
          if (this.logoFile()) {
            await this.dataRequestService.uploadLogo(dataRequest.id, this.logoFile()!).then(() => {
              this.logoFile.set(null);
            });
          }
        });
    }
  }
  protected handleClose() {
    this.router.navigate([ROUTE_PATHS.DATA_REQUESTS_CONSUMER_PATH], {
      state: { [FORCE_RELOAD_DATA_REQUESTS_STATE_PARAM]: this.refreshListNeeded() },
    });
  }

  updateFormSteps(id?: string, valid?: boolean) {
    this.formControlSteps.update((steps) =>
      steps.map((step) => {
        if (id && step.id !== id) {
          return step;
        }

        const form = this.form;
        const formGroup = form.get(step.id) as unknown as FormGroup;

        if (formGroup.disabled) {
          return {
            ...step,
            isValid: true,
            completed: true,
          };
        }

        // Update the validity state of the form group
        const isValid = valid ?? formGroup?.valid;

        return {
          ...step,
          isValid,
          completed: this.isStepCompleted(formGroup, step.id),
        };
      }),
    );
  }

  private isStepCompleted(formGroup: FormGroup, formGroupName: string): boolean {
    const stepConfig = this.formMap.find((item) => item.formGroupName === formGroupName);

    if (!stepConfig) return false;

    switch (stepConfig.completionStrategy) {
      case FORM_COMPLETION_STRATEGIES.ALWAYS_COMPLETE:
        // For steps like preview that are considered complete once visited
        return true;

      case FORM_COMPLETION_STRATEGIES.EXTERNAL_DEPENDENCY:
        // Steps 5 & 6 would use this - check external conditions
        return this.checkExternalCompletion(formGroupName);

      case FORM_COMPLETION_STRATEGIES.FORM_VALIDATION:
      default:
        // Default strategy - use form validation
        return formGroup?.valid && Object.keys(formGroup.controls).length > 0;
    }
  }

  private checkExternalCompletion(formGroupName: string): boolean {
    // Logic for contract and completion steps
    if (
      formGroupName === FORM_GROUP_NAMES.CONTRACT ||
      formGroupName === FORM_GROUP_NAMES.COMPLETION
    ) {
      // Example: Check if contract is signed or whatever condition you need
      return false;
    }
    return true;
  }

  handleSaveLogo(logo: File) {
    this.logoFile.set(logo);
    const dataRequestId = this.currentDataRequestId();
    if (dataRequestId) {
      this.dataRequestService.uploadLogo(dataRequestId, logo).then(() => {
        this.logoFile.set(null);
      });
    }
  }

  invitationLink() {
    return `${globalThis.location.origin}/consent-requests/create/${this.currentDataRequestId()}`;
  }
}
