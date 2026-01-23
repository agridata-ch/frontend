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
  untracked,
  ViewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  faArrowLeft,
  faArrowRight,
  faRotateLeft,
} from '@awesome.me/kit-0b6d1ed528/icons/classic/regular';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { TranslocoService } from '@jsverse/transloco';
import { debounceTime, firstValueFrom } from 'rxjs';

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
  flattenFormGroup,
  populateFormFromDto,
  setControlValue,
} from '@/shared/lib/form.helper';
import { SidepanelComponent } from '@/shared/sidepanel';
import { ToastType } from '@/shared/toast';
import { ButtonComponent, ButtonVariants } from '@/shared/ui/button';
import { AgridataWizardComponent, WizardStep } from '@/widgets/agridata-wizard';
import {
  DataRequestFormConsumerComponent,
  DataRequestFormProducerComponent,
  DataRequestFormRequestComponent,
  DataRequestFormContractComponent,
} from '@/widgets/data-request-form';
import {
  dataRequestFormsModel,
  FormModel,
  FORM_COMPLETION_STRATEGIES,
  FORM_GROUP_NAMES,
} from '@/widgets/data-request-new';
import { DataRequestPreviewComponent } from '@/widgets/data-request-preview';

export const DATA_REQUEST_NEW_ID = 'new';

/**
 * Implements the wizard-driven data request creation flow. It manages multiple form groups,
 * synchronizes validation states, handles saving and submission, and integrates services for
 * persistence, logo uploads, and translations. It ensures smooth navigation across steps and
 * manages draft, submission, and completion logic.
 *
 * CommentLastReviewed: 2025-12-02
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
    DataRequestFormContractComponent,
  ],
  templateUrl: './data-request-new.component.html',
})
export class DataRequestNewComponent {
  // Injects
  private readonly dataRequestService = inject(DataRequestService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly errorService = inject(ErrorHandlerService);
  private readonly i18nService = inject(I18nService);
  private readonly router = inject(Router);
  private readonly translateService = inject(TranslocoService);

  // Constants
  protected readonly form = this.createForm();
  protected readonly ButtonVariants = ButtonVariants;
  protected readonly FORM_GROUP_NAMES = FORM_GROUP_NAMES;
  protected readonly ConsentRequestDetailViewDtoDataRequestStateCode =
    ConsentRequestDetailViewDtoDataRequestStateCode;
  protected readonly ToastType = ToastType;
  protected readonly nextIcon = faArrowRight;
  protected readonly previousIcon = faArrowLeft;
  protected readonly retreatIcon = faRotateLeft;

  // Input properties
  readonly dataRequestId = input<string | undefined>();

  // Signals
  protected readonly consumerLabel = this.i18nService.translateSignal(
    'data-request.wizard.steps.consumer',
  );
  protected readonly contractLabel = this.i18nService.translateSignal(
    'data-request.wizard.steps.contract',
  );
  protected readonly completionLabel = this.i18nService.translateSignal(
    'data-request.wizard.steps.completion',
  );
  protected readonly logoFile = signal<File | null>(null);
  protected readonly previewLabel = this.i18nService.translateSignal(
    'data-request.wizard.steps.preview',
  );
  protected readonly producerLabel = this.i18nService.translateSignal(
    'data-request.wizard.steps.producer',
  );
  protected readonly requestLabel = this.i18nService.translateSignal(
    'data-request.wizard.steps.request',
  );

  // contains current data request state
  protected readonly dataRequest = signal<DataRequestDto | undefined>(undefined);
  // writable signal used when data request is created
  protected readonly currentDataRequestId = signal<string | undefined>(undefined);
  protected readonly isSaving = signal(false);
  protected readonly refreshListNeeded = signal(false);
  protected readonly formControlSteps = signal<WizardStep[]>(
    dataRequestFormsModel.map((step) => {
      const isDisabled =
        step.formGroupName === FORM_GROUP_NAMES.CONTRACT ||
        step.formGroupName === FORM_GROUP_NAMES.COMPLETION;

      return {
        id: step.formGroupName,
        label: this.getStepLabelSignal(step.formGroupName),
        isValid: true,
        completed: false,
        disabled: isDisabled,
      };
    }),
  );

  protected readonly dataRequestsResource = resource({
    params: () => ({ id: this.dataRequestId() }),
    loader: ({ params }) => {
      if (!params?.id || params.id === DATA_REQUEST_NEW_ID) {
        return Promise.resolve(undefined);
      }
      return this.dataRequestService.fetchDataRequest(params.id);
    },
  });

  protected readonly initialRequest = createResourceValueComputed(this.dataRequestsResource);

  protected readonly formDisabled = computed(() => {
    const request = this.dataRequest();
    return (
      !!request?.stateCode &&
      request.stateCode !== ConsentRequestDetailViewDtoDataRequestStateCode.Draft
    );
  });

  // Effects (private)
  private readonly errorHandlerEffect = createResourceErrorHandlerEffect(
    this.dataRequestsResource,
    this.errorService,
  );

  private readonly formGroupDisabledEffect = effect(() => {
    const disabled = this.formDisabled();
    const form = this.form;
    form.updateValueAndValidity();

    // disable or enable the entire form based on disabled state
    if (form) {
      if (disabled) {
        form.disable({ emitEvent: false });
      } else {
        form.enable({ emitEvent: false });
      }
    }
  });

  private readonly updateDataRequestFromRessourceEffect = effect(() => {
    const request = this.initialRequest();
    if (request?.id) {
      this.dataRequest.set(request);
      populateFormFromDto(
        this.form,
        request as unknown as Record<string, unknown>,
        dataRequestFormsModel,
      );
      this.form.markAllAsTouched();
      this.updateFormSteps();
    }
  });

  private readonly updateDataRequestIdFromRouteEffect = effect(() => {
    if (this.dataRequestId() !== DATA_REQUEST_NEW_ID) {
      this.currentDataRequestId.set(this.dataRequestId());
    }
  });

  @ViewChild(AgridataWizardComponent)
  protected readonly wizard!: AgridataWizardComponent;

  protected handleClose() {
    this.router.navigate([ROUTE_PATHS.DATA_REQUESTS_CONSUMER_PATH], {
      state: { [FORCE_RELOAD_DATA_REQUESTS_STATE_PARAM]: this.refreshListNeeded() },
    });
  }

  protected handleNextStep() {
    if (!this.formDisabled()) this.handleSave();

    const nextStepDisabled = this.isNextStepDisabled();

    if (!nextStepDisabled) {
      this.wizard.nextStep();
    }
  }

  protected handlePreviousStep() {
    if (!this.formDisabled()) this.handleSave();
    this.wizard.previousStep();
  }

  protected handleSave() {
    if (this.formDisabled()) return;

    const id = this.wizard.currentStepId();
    const form = this.form;
    form.get(id)?.markAllAsTouched();
    this.updateFormSteps(id, form.get(id)?.valid ?? false);
    return this.createOrSaveDataRequest();
  }

  protected handleSaveAndComplete() {
    const form = this.form;
    form.markAllAsTouched();
    if (form.invalid) {
      console.error('Form is invalid, cannot save data request');
      return;
    }
  }

  protected handleSaveLogo(logo: File) {
    this.logoFile.set(logo);
    const dataRequestId = this.currentDataRequestId();
    if (dataRequestId) {
      this.dataRequestService.uploadLogo(dataRequestId, logo).then(() => {
        this.logoFile.set(null);
      });
    }
  }

  protected handleStepChange() {
    if (!this.formDisabled()) this.handleSave();
  }

  protected async handleSubmitAndContinue() {
    await this.handleSave();

    this.form.markAllAsTouched();
    this.updateFormSteps();
    const dataRequestId = this.currentDataRequestId();
    if (this.form.valid && dataRequestId) {
      this.isSaving.set(true);
      await this.dataRequestService
        .submitDataRequest(dataRequestId)
        .then((dataRequest: DataRequestDto) => {
          this.dataRequest.set(dataRequest);
          this.updateFormSteps();
          this.wizard.nextStep();
          this.router.navigate([ROUTE_PATHS.DATA_REQUESTS_CONSUMER_PATH, dataRequestId], {
            state: { [FORCE_RELOAD_DATA_REQUESTS_STATE_PARAM]: this.refreshListNeeded() },
          });
        })
        .catch((error) => {
          this.errorService.handleError(error);
        })
        .finally(() => this.isSaving.set(false));
    } else {
      console.error('Form is invalid, cannot submit data request');
    }
  }

  protected async handleRetreat() {
    this.refreshListNeeded.set(true);
    const dataRequestId = this.currentDataRequestId();
    if (!dataRequestId) return;
    await this.dataRequestService
      .retreatDataRequest(dataRequestId)
      .then((dataRequest: DataRequestDto) => {
        this.dataRequest.set(dataRequest);
        this.updateFormSteps();

        if (this.wizard.currentStepId() === FORM_GROUP_NAMES.CONTRACT) {
          this.wizard.previousStep();
        }
      });
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

  private createForm() {
    const newForm = buildReactiveForm(
      DataRequestUpdateDto,
      dataRequestFormsModel,
      this.i18nService,
    );

    dataRequestFormsModel.forEach((form) => {
      const fg = newForm.get(form.formGroupName) as unknown as FormGroup;
      fg.statusChanges
        .pipe(takeUntilDestroyed(this.destroyRef), debounceTime(400))
        .subscribe(() => {
          if (fg.dirty) {
            this.updateFormSteps(form.formGroupName, fg.valid);
          }
        });
      this.updateDefaultValues(form, fg);
    });
    return newForm;
  }

  private updateDefaultValues(form: FormModel, formGroup: FormGroup) {
    form.fields.forEach((field) => {
      if (field.i18nDefaultValue) {
        const control = formGroup.get(field.name);
        if (control) {
          firstValueFrom(this.translateService.selectTranslate(field.i18nDefaultValue)).then(
            (value) => {
              setControlValue(formGroup, field.name, value, true);
            },
          );
        }
      }
    });
  }

  private async createOrSaveDataRequest() {
    this.refreshListNeeded.set(true);
    this.isSaving.set(true);
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
        })
        .finally(() => this.isSaving.set(false));
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
        })
        .finally(() => this.isSaving.set(false));
    }

    this.isSaving.set(false);
  }

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

  private isStepCompleted(formGroup: FormGroup, formGroupName: string): boolean {
    const stepConfig = dataRequestFormsModel.find((item) => item.formGroupName === formGroupName);

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

  private updateFormSteps(id?: string, valid?: boolean) {
    const currentStateCode = untracked(() => this.dataRequest()?.stateCode);

    this.formControlSteps.update((steps) =>
      steps.map((step) => {
        const form = this.form;
        const formGroup = form.get(step.id) as unknown as FormGroup;

        let isDisabled = false;
        if (step.id === FORM_GROUP_NAMES.CONTRACT) {
          // CONTRACT is disabled if Draft or no stateCode (new request)
          isDisabled =
            !currentStateCode ||
            currentStateCode === ConsentRequestDetailViewDtoDataRequestStateCode.Draft;
        }
        if (step.id === FORM_GROUP_NAMES.COMPLETION) {
          isDisabled = currentStateCode !== ConsentRequestDetailViewDtoDataRequestStateCode.Active;
        }

        // If we're only updating a specific step and this isn't it, only update disabled state
        if (id && step.id !== id) {
          return {
            ...step,
            disabled: isDisabled,
          };
        }

        if (formGroup.disabled) {
          return {
            ...step,
            isValid: true,
            completed: true,
            disabled: isDisabled,
          };
        }

        // Update the validity state of the form group
        const isValid = valid ?? formGroup?.valid;

        return {
          ...step,
          isValid,
          completed: this.isStepCompleted(formGroup, step.id),
          disabled: isDisabled,
        };
      }),
    );
  }

  protected isNextStepDisabled(): boolean {
    // Get the current step index and check if the next step is enabled
    const steps = this.formControlSteps();
    const currentStepId = this.wizard?.currentStepId();
    const currentIndex = steps.findIndex((s) => s.id === currentStepId);
    const nextStep = steps[currentIndex + 1];

    return nextStep.disabled === true;
  }
}
