import { Component, computed, inject, input } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';

import { COUNTRIES } from '@/shared/constants/constants';
import { I18nDirective, I18nService } from '@/shared/i18n';
import { AuthService } from '@/shared/lib/auth';
import { getFormControl } from '@/shared/lib/form.helper';
import { FormControlComponent } from '@/shared/ui/form-control';
import { ControlTypes } from '@/shared/ui/form-control/form-control.model';

@Component({
  selector: 'app-data-request-form-consumer',
  imports: [ReactiveFormsModule, I18nDirective, FormControlComponent],
  templateUrl: './data-request-form-consumer.component.html',
})
export class DataRequestFormConsumerComponent {
  readonly i18nService = inject(I18nService);
  readonly authService = inject(AuthService);
  readonly form = input<FormGroup>();
  readonly ControlTypes = ControlTypes;
  readonly getFormControl = getFormControl;

  readonly userData = computed(() => this.authService.userData());
  readonly countries = computed(() => {
    return Object.entries(COUNTRIES).map(([key, value]) => {
      return {
        label: this.i18nService.translate(`countries.${key}`),
        value: value,
      };
    });
  });

  ngOnInit() {
    const userDataName = this.userData()?.name;
    if (userDataName) {
      this.form()?.patchValue({ consumer: { dataConsumerDisplayName: userDataName } });
    }
  }
}
