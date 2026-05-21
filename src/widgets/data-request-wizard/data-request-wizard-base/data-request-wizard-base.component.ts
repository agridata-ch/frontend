import { Location } from '@angular/common';
import {
  computed,
  DestroyRef,
  Directive,
  effect,
  inject,
  input,
  Signal,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import {
  faArrowLeft,
  faArrowRight,
  faRotateLeft,
} from '@awesome.me/kit-0b6d1ed528/icons/classic/regular';
import { TranslocoService } from '@jsverse/transloco';
import { debounceTime, firstValueFrom } from 'rxjs';

import { ErrorHandlerService } from '@/app/error/error-handler.service';
import { DataRequestUpdateDto } from '@/assets/formSchemas/agridata-schemas.json';
import { DataRequestService } from '@/entities/api';
import { DataRequestDto, DataRequestStateEnum } from '@/entities/openapi';
import { I18nService } from '@/shared/i18n';
import { AuthService } from '@/shared/lib/auth';
import { buildReactiveForm, populateFormFromDto, setControlValue } from '@/shared/lib/form.helper';
import { ToastService, ToastType } from '@/shared/toast';
import { ButtonVariants } from '@/shared/ui/button';
import { AgridataWizardComponent, WizardStep } from '@/widgets/agridata-wizard';
import {
  isStepCompleted,
  dataRequestFormsModel,
  FormModel,
  FORM_GROUP_NAMES,
  DATA_REQUEST_NEW_ID,
} from '@/widgets/data-request-wizard';

/**
 * Abstract base for data request wizard components. Contains shared logic for form management,
 * wizard navigation, and step validation. Extended by consumer and provider implementations.
 *
 * CommentLastReviewed: 2026-04-09
 */
@Directive()
export abstract class DataRequestWizardBaseComponent {
  // Injects
  protected readonly authService = inject(AuthService);
  protected readonly dataRequestService = inject(DataRequestService);
  protected readonly destroyRef = inject(DestroyRef);
  protected readonly errorService = inject(ErrorHandlerService);
  protected readonly i18nService = inject(I18nService);
  protected readonly location = inject(Location);
  protected readonly router = inject(Router);
  protected readonly translateService = inject(TranslocoService);
  protected readonly toastService = inject(ToastService);

  // Constants
  protected readonly form = this.createForm();
  protected readonly ButtonVariants = ButtonVariants;
  protected readonly DataRequestStateEnum = DataRequestStateEnum;
  protected readonly FORM_GROUP_NAMES = FORM_GROUP_NAMES;
  protected readonly nextIcon = faArrowRight;
  protected readonly previousIcon = faArrowLeft;
  protected readonly retreatIcon = faRotateLeft;
  protected readonly ToastType = ToastType;

  // Input properties
  readonly dataRequestId = input<string | undefined>();
  readonly initialDataRequest = input<DataRequestDto | undefined>();
  readonly isLoading = input<boolean>(false);

  // Signals
  protected readonly currentDataRequestId = signal<string | undefined>(undefined);
  protected readonly dataRequest = signal<DataRequestDto | undefined>(undefined);
  protected readonly formControlSteps = signal<WizardStep[]>([]);
  protected readonly isSaving = signal<boolean>(false);
  protected readonly refreshListNeeded = signal<boolean>(false);

  protected readonly isDataConsumer = this.authService.isConsumer();
  protected readonly isDataProvider = this.authService.isDataProvider();

  // Computed Signals
  protected readonly formDisabled = computed(() => {
    const request = this.dataRequest();
    return !!request?.stateCode && request.stateCode !== DataRequestStateEnum.Draft;
  });

  // Abstract properties
  protected abstract readonly formsModel: FormModel[];
  protected abstract readonly listRoutePath: string;
  protected abstract readonly stepLabelMap: Record<string, Signal<string | undefined>>;

  // ViewChild
  protected readonly wizard = viewChild(AgridataWizardComponent);

  // Effects
  private readonly formGroupDisabledEffect = effect(() => {
    const disabled = this.formDisabled();
    const form = this.form;
    form.updateValueAndValidity();

    if (form) {
      if (disabled) {
        form.disable({ emitEvent: false });
      } else {
        form.enable({ emitEvent: false });
      }
    }
  });

  private readonly initializeFormControlStepsEffect = effect(() => {
    const steps = this.formsModel.map((step) => ({
      id: step.formGroupName,
      label: this.getStepLabel(step.formGroupName),
      isValid: true,
      completed: false,
      disabled: this.getInitialStepDisabled(step.formGroupName),
    }));
    untracked(() => this.formControlSteps.set(steps));
  });

  private readonly updateDataRequestFromInputEffect = effect(() => {
    const request = this.initialDataRequest();
    if (request?.id) {
      untracked(() => {
        this.dataRequest.set(request);
        populateFormFromDto(
          this.form,
          request as unknown as Record<string, unknown>,
          this.formsModel,
        );
        this.form.markAllAsTouched();
        this.updateFormSteps();
      });
    }
  });

  private readonly updateDataRequestIdFromRouteEffect = effect(() => {
    if (this.dataRequestId() !== DATA_REQUEST_NEW_ID) {
      this.currentDataRequestId.set(this.dataRequestId());
    }
  });

  // Protected abstract methods
  protected abstract checkExternalCompletion(formGroupName: string): boolean;

  protected abstract getInitialStepDisabled(formGroupName: string): boolean;

  protected abstract getStepDisabled(stepId: string, stateCode: string | undefined): boolean;

  // Protected methods
  protected getStepLabel(formGroupName: string): string {
    return this.stepLabelMap[formGroupName]?.() ?? '';
  }

  protected handleClose() {
    this.router.navigate([this.listRoutePath], {
      state: { forceReload: this.refreshListNeeded() },
    });
  }

  protected handleNextStep() {
    if (!this.formDisabled()) this.handleSave();

    const nextStepDisabled = this.isNextStepDisabled();
    if (!nextStepDisabled) {
      this.wizard()?.nextStep();
    }
  }

  protected handlePreviousStep() {
    if (!this.formDisabled()) this.handleSave();
    this.wizard()?.previousStep();
  }

  protected async handleReloadDataRequest() {
    const dataRequestId = this.currentDataRequestId();
    if (!dataRequestId) return;
    await this.dataRequestService
      .fetchDataRequest(dataRequestId)
      .then((dataRequest: DataRequestDto) => {
        this.refreshListNeeded.set(true);
        this.dataRequest.set(dataRequest);
        this.updateFormSteps();
      })
      .catch((error) => {
        this.errorService.handleError(error);
      });
  }

  protected handleSave() {
    if (this.formDisabled()) return;

    const id = this.wizard()?.currentStepId();
    if (!id) return;

    this.form.get(id ?? '')?.markAllAsTouched();
    this.updateFormSteps(id, this.form.get(id ?? '')?.valid ?? false);
    return this.saveDataRequest();
  }

  protected handleStepChange() {
    if (!this.formDisabled()) this.handleSave();
  }

  protected isNextStepDisabled(): boolean {
    const steps = this.formControlSteps();
    const currentStepId = this.wizard()?.currentStepId();
    const currentIndex = steps.findIndex((s) => s.id === currentStepId);
    const nextStep = steps[currentIndex + 1];
    return nextStep?.disabled === true;
  }

  protected saveDataRequest(): Promise<void> {
    return Promise.resolve();
  }

  protected updateFormSteps(id?: string, valid?: boolean) {
    const currentStateCode = untracked(() => this.dataRequest()?.stateCode);

    this.formControlSteps.update((steps) =>
      steps.map((step) => {
        const formGroup = this.form.get(step.id) as unknown as FormGroup;
        const isDisabled = this.getStepDisabled(step.id, currentStateCode);

        if (id && step.id !== id) {
          return { ...step, disabled: isDisabled };
        }

        const isValid = valid ?? formGroup?.valid;
        return {
          ...step,
          isValid: formGroup?.disabled ? true : (isValid ?? true),
          completed: isStepCompleted(formGroup, this.formsModel, step.id, (name) =>
            this.checkExternalCompletion(name),
          ),
          disabled: isDisabled,
        };
      }),
    );
  }

  // Private methods
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
}
