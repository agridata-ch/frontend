import { CommonModule } from '@angular/common';
import { Component, computed, effect, Signal, signal, untracked } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

import { DataRequestDto, DataRequestStateEnum } from '@/entities/openapi';
import { FORCE_RELOAD_DATA_REQUESTS_STATE_PARAM } from '@/pages/data-requests-consumer';
import { ROUTE_PATHS } from '@/shared/constants/constants';
import { ErrorOutletComponent } from '@/shared/error-alert-outlet/error-outlet.component';
import { I18nDirective } from '@/shared/i18n';
import { flattenFormGroup } from '@/shared/lib/form.helper';
import { SidepanelComponent } from '@/shared/sidepanel';
import { ToastType } from '@/shared/toast';
import { ButtonComponent } from '@/shared/ui/button';
import { AgridataWizardComponent } from '@/widgets/agridata-wizard';
import { DataRequestCompletionComponent } from '@/widgets/data-request-completion';
import {
  DataRequestFormConsumerComponent,
  DataRequestFormContractComponent,
  DataRequestFormProducerComponent,
  DataRequestFormRequestComponent,
} from '@/widgets/data-request-form';
import { DataRequestPreviewComponent } from '@/widgets/data-request-preview';
import { dataRequestFormsModel, FORM_GROUP_NAMES } from '@/widgets/data-request-wizard';
import { DataRequestWizardBaseComponent } from '@/widgets/data-request-wizard/data-request-wizard-base';

/**
 * Consumer-specific data request wizard. Handles creation, editing, submission,
 * and release of data requests from the consumer perspective.
 *
 * CommentLastReviewed: 2026-04-09
 */
@Component({
  selector: 'app-data-request-wizard-consumer',
  imports: [
    AgridataWizardComponent,
    ButtonComponent,
    CommonModule,
    DataRequestCompletionComponent,
    DataRequestFormConsumerComponent,
    DataRequestFormContractComponent,
    DataRequestFormProducerComponent,
    DataRequestFormRequestComponent,
    DataRequestPreviewComponent,
    ErrorOutletComponent,
    FontAwesomeModule,
    I18nDirective,
    ReactiveFormsModule,
    SidepanelComponent,
  ],
  templateUrl: './data-request-wizard-consumer.component.html',
})
export class DataRequestWizardConsumerComponent extends DataRequestWizardBaseComponent {
  // Constants
  protected override readonly formsModel = dataRequestFormsModel;
  protected override readonly listRoutePath = ROUTE_PATHS.DATA_REQUESTS_CONSUMER_PATH;

  // Signals
  protected override readonly stepLabelMap: Record<string, Signal<string | undefined>> = {
    [FORM_GROUP_NAMES.COMPLETION]: this.i18nService.translateSignal(
      'data-request.wizard.consumer.steps.completion',
    ),
    [FORM_GROUP_NAMES.CONSUMER]: this.i18nService.translateSignal(
      'data-request.wizard.consumer.steps.consumer',
    ),
    [FORM_GROUP_NAMES.CONTRACT]: this.i18nService.translateSignal(
      'data-request.wizard.consumer.steps.contract',
    ),
    [FORM_GROUP_NAMES.PREVIEW]: this.i18nService.translateSignal(
      'data-request.wizard.consumer.steps.preview',
    ),
    [FORM_GROUP_NAMES.PRODUCER]: this.i18nService.translateSignal(
      'data-request.wizard.consumer.steps.producer',
    ),
    [FORM_GROUP_NAMES.REQUEST]: this.i18nService.translateSignal(
      'data-request.wizard.consumer.steps.request',
    ),
  };
  protected readonly hasFreshReleasedToProvider = signal<boolean>(false);
  protected readonly isHandlingReleaseDataRequest = signal<boolean>(false);
  protected readonly logoFile = signal<File | null>(null);

  // Computed Signals
  protected readonly canReleaseDataRequest = computed(() => {
    const request = this.dataRequest();
    return request?.stateCode === DataRequestStateEnum.ToBeReleasedByConsumer;
  });

  // Effects
  private readonly setInitialWizardStepEffect = effect(() => {
    const wizard = this.wizard();
    const loading = this.isLoading();
    if (loading || !wizard) return;

    untracked(() => {
      const stateCode = this.dataRequest()?.stateCode;
      if (
        wizard &&
        (stateCode === DataRequestStateEnum.ToBeSignedByConsumer ||
          stateCode === DataRequestStateEnum.InReview)
      ) {
        wizard.handleChangeStep(
          this.formControlSteps().findIndex((step) => step.id === FORM_GROUP_NAMES.CONTRACT) || 0,
        );
      } else if (
        wizard &&
        (
          [
            DataRequestStateEnum.ToBeReleasedByConsumer,
            DataRequestStateEnum.ToBeSignedByProvider,
            DataRequestStateEnum.ToBeReleasedByProvider,
            DataRequestStateEnum.ToBeActivated,
          ] as DataRequestStateEnum[]
        ).includes(stateCode as DataRequestStateEnum)
      ) {
        wizard.handleChangeStep(
          this.formControlSteps().findIndex((step) => step.id === FORM_GROUP_NAMES.COMPLETION) || 0,
        );
      }
    });
  });

  // Overrides
  protected override checkExternalCompletion(formGroupName: string): boolean {
    const stateCode = this.dataRequest()?.stateCode;
    if (formGroupName === FORM_GROUP_NAMES.CONTRACT) {
      return !(
        [
          DataRequestStateEnum.Draft,
          DataRequestStateEnum.InReview,
          DataRequestStateEnum.ToBeSignedByConsumer,
        ] as DataRequestStateEnum[]
      ).includes(stateCode as DataRequestStateEnum);
    } else if (formGroupName === FORM_GROUP_NAMES.COMPLETION) {
      return (
        [
          DataRequestStateEnum.ToBeSignedByProvider,
          DataRequestStateEnum.ToBeReleasedByProvider,
          DataRequestStateEnum.ToBeActivated,
          DataRequestStateEnum.Active,
        ] as DataRequestStateEnum[]
      ).includes(stateCode as DataRequestStateEnum);
    }
    return true;
  }

  protected override getInitialStepDisabled(formGroupName: string): boolean {
    return (
      formGroupName === FORM_GROUP_NAMES.CONTRACT || formGroupName === FORM_GROUP_NAMES.COMPLETION
    );
  }

  protected override getStepDisabled(stepId: string, stateCode: string | undefined): boolean {
    if (stepId === FORM_GROUP_NAMES.CONTRACT) {
      return !stateCode || stateCode === DataRequestStateEnum.Draft;
    }
    if (stepId === FORM_GROUP_NAMES.COMPLETION) {
      return (
        stateCode !== DataRequestStateEnum.ToBeReleasedByConsumer &&
        stateCode !== DataRequestStateEnum.ToBeSignedByProvider &&
        stateCode !== DataRequestStateEnum.ToBeReleasedByProvider &&
        stateCode !== DataRequestStateEnum.ToBeActivated
      );
    }
    return false;
  }

  protected override handleClose() {
    this.router.navigate([this.listRoutePath], {
      state: { [FORCE_RELOAD_DATA_REQUESTS_STATE_PARAM]: this.refreshListNeeded() },
    });
  }

  protected override handlePreviousStep() {
    super.handlePreviousStep();
    this.hasFreshReleasedToProvider.set(false);
  }

  protected override async saveDataRequest() {
    this.refreshListNeeded.set(true);
    this.isSaving.set(true);
    const flattenForm = flattenFormGroup(this.form);
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
          this.location.replaceState(
            `${ROUTE_PATHS.DATA_REQUESTS_CONSUMER_PATH}/${dataRequest.id}`,
          );
          if (this.logoFile()) {
            await this.dataRequestService.uploadLogo(dataRequest.id, this.logoFile()!).then(() => {
              this.logoFile.set(null);
            });
          }
        })
        .finally(() => this.isSaving.set(false));
    }
  }

  // Protected methods
  protected async handleRelease() {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    const dataRequestId = this.currentDataRequestId();
    if (!dataRequestId) return;

    this.isHandlingReleaseDataRequest.set(true);
    await this.dataRequestService
      .releaseDataRequestToProvider(dataRequestId)
      .then((dataRequest: DataRequestDto) => {
        this.toastService.show(
          this.i18nService.translate('data-request.wizard.provider.releaseContract.success.title'),
          this.i18nService.translate(
            'data-request.wizard.provider.releaseContract.success.message',
          ),
          ToastType.Success,
        );
        this.refreshListNeeded.set(true);
        this.dataRequest.set(dataRequest);
        this.updateFormSteps();
        this.hasFreshReleasedToProvider.set(true);
      })
      .catch((error) => {
        this.errorService.handleError(error);
      })
      .finally(() => this.isHandlingReleaseDataRequest.set(false));
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

        if (
          this.wizard()?.currentStepId() === FORM_GROUP_NAMES.CONTRACT ||
          this.wizard()?.currentStepId() === FORM_GROUP_NAMES.COMPLETION
        ) {
          this.wizard()?.handleChangeStep(
            this.formControlSteps().findIndex((step) => step.id === FORM_GROUP_NAMES.PRODUCER) || 0,
          );
        }
      });
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
          this.refreshListNeeded.set(true);
          this.dataRequest.set(dataRequest);
          this.updateFormSteps();
          this.wizard()?.nextStep();
        })
        .catch((error) => {
          this.errorService.handleError(error);
        })
        .finally(() => this.isSaving.set(false));
    }
  }
}
