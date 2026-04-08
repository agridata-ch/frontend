import { FormGroup } from '@angular/forms';

import { FORM_COMPLETION_STRATEGIES, FormModel } from './data-request-wizard.model';

export function isStepCompleted(
  formGroup: FormGroup,
  formsModel: FormModel[],
  formGroupName: string,
  checkExternalCompletion: (name: string) => boolean,
): boolean {
  const stepConfig = formsModel.find((item) => item.formGroupName === formGroupName);
  if (!stepConfig) return false;

  switch (stepConfig.completionStrategy) {
    case FORM_COMPLETION_STRATEGIES.ALWAYS_COMPLETE:
      return true;
    case FORM_COMPLETION_STRATEGIES.EXTERNAL_DEPENDENCY:
      return checkExternalCompletion(formGroupName);
    case FORM_COMPLETION_STRATEGIES.FORM_VALIDATION:
    default:
      return formGroup?.valid && Object.keys(formGroup.controls).length > 0;
  }
}
