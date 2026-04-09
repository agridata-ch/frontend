import { CommonModule } from '@angular/common';
import { Component, computed, Signal } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

import { DataRequestStateEnum } from '@/entities/openapi';
import { ROUTE_PATHS } from '@/shared/constants/constants';
import { ErrorOutletComponent } from '@/shared/error-alert-outlet/error-outlet.component';
import { I18nDirective } from '@/shared/i18n';
import { SidepanelComponent } from '@/shared/sidepanel';
import { ButtonComponent } from '@/shared/ui/button';
import { AgridataWizardComponent } from '@/widgets/agridata-wizard';
import { DataRequestCompletionComponent } from '@/widgets/data-request-completion';
import { DataRequestFormContractComponent } from '@/widgets/data-request-form';
import { DataRequestPreviewComponent } from '@/widgets/data-request-preview';
import { dataRequestProviderFormsModel, FORM_GROUP_NAMES } from '@/widgets/data-request-wizard';
import { DataRequestWizardBaseComponent } from '@/widgets/data-request-wizard/data-request-wizard-base';

/**
 * Provider-specific data request wizard. Displays read-only preview and handles
 * contract signing from the provider perspective.
 *
 * CommentLastReviewed: 2026-04-09
 */
@Component({
  selector: 'app-data-request-wizard-provider',
  imports: [
    AgridataWizardComponent,
    ButtonComponent,
    CommonModule,
    DataRequestCompletionComponent,
    DataRequestFormContractComponent,
    DataRequestPreviewComponent,
    ErrorOutletComponent,
    FontAwesomeModule,
    I18nDirective,
    ReactiveFormsModule,
    SidepanelComponent,
  ],
  templateUrl: './data-request-wizard-provider.component.html',
})
export class DataRequestWizardProviderComponent extends DataRequestWizardBaseComponent {
  // Constants
  protected override readonly formsModel = dataRequestProviderFormsModel;
  protected override readonly listRoutePath = ROUTE_PATHS.DATA_REQUESTS_PROVIDER_PATH;

  // Signals
  protected override readonly stepLabelMap: Record<string, Signal<string | undefined>> = {
    [FORM_GROUP_NAMES.COMPLETION]: this.i18nService.translateSignal(
      'data-request.wizard.provider.steps.completion',
    ),
    [FORM_GROUP_NAMES.CONTRACT]: this.i18nService.translateSignal(
      'data-request.wizard.provider.steps.contract',
    ),
    [FORM_GROUP_NAMES.PREVIEW]: this.i18nService.translateSignal(
      'data-request.wizard.provider.steps.preview',
    ),
  };

  // Computed Signals
  protected readonly canReleaseContract = computed(() => {
    const request = this.dataRequest();
    return request?.stateCode === DataRequestStateEnum.ToBeReleasedByProvider;
  });

  // Overrides
  protected override checkExternalCompletion(formGroupName: string): boolean {
    const stateCode = this.dataRequest()?.stateCode;
    if (formGroupName === FORM_GROUP_NAMES.CONTRACT) {
      return ([DataRequestStateEnum.ToBeReleasedByProvider] as DataRequestStateEnum[]).includes(
        stateCode as DataRequestStateEnum,
      );
    } else if (formGroupName === FORM_GROUP_NAMES.COMPLETION) {
      return stateCode === DataRequestStateEnum.Active;
    }
    return true;
  }

  protected override getInitialStepDisabled(formGroupName: string): boolean {
    return (
      formGroupName === FORM_GROUP_NAMES.CONTRACT || formGroupName === FORM_GROUP_NAMES.COMPLETION
    );
  }

  protected override getStepDisabled(stepId: string, stateCode: string | undefined): boolean {
    if (stepId === FORM_GROUP_NAMES.COMPLETION) {
      return (
        stateCode !== DataRequestStateEnum.ToBeReleasedByProvider &&
        stateCode !== DataRequestStateEnum.Active
      );
    }
    return false;
  }

  // Protected methods
  protected async handleReleaseContract() {
    const dataRequestId = this.currentDataRequestId();
    if (!dataRequestId) return;
    // TODO: Implement contract signing for provider
  }
}
