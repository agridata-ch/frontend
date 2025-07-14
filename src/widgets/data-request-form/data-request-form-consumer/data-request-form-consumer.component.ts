import { Component, computed, effect, inject, input, signal } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';

import { UidRegisterService } from '@/entities/api/uid-register.service';
import { COUNTRIES } from '@/shared/constants/constants';
import { I18nDirective, I18nService } from '@/shared/i18n';
import { AuthService, UserData } from '@/shared/lib/auth';
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
  readonly uidSearchService = inject(UidRegisterService);

  readonly form = input<FormGroup>();
  readonly ControlTypes = ControlTypes;
  readonly getFormControl = getFormControl;

  readonly uidInfoResource = this.uidSearchService.uidInfosOfCurrentUser;
  readonly userData = signal<UserData | null>(this.authService.userData());

  readonly countries = computed(() => {
    return Object.entries(COUNTRIES).map(([key, value]) => {
      return {
        label: this.i18nService.translate(`countries.${key}`),
        value: value,
      };
    });
  });

  readonly updateFormEffect = effect(() => {
    const uidSearchResult = this.uidInfoResource.value();
    const currentUserData = this.userData();

    if (uidSearchResult && currentUserData && uidSearchResult.legalName !== currentUserData.name) {
      const newUserData = {
        ...currentUserData,
        uid: uidSearchResult.uid || currentUserData.uid,
        name: uidSearchResult.legalName || currentUserData.name,
      };
      this.userData.set(newUserData);

      this.form()?.patchValue({
        consumer: {
          dataConsumerDisplayName: uidSearchResult.legalName,
          dataConsumerCity: uidSearchResult.address?.city,
          dataConsumerZip: uidSearchResult.address?.zip,
          dataConsumerStreet: uidSearchResult.address?.street,
          dataConsumerCountry: uidSearchResult.address?.country,
        },
      });
    }
  });
}
