import { Component, computed, effect, inject, input, output, signal } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';

import { UidRegisterService } from '@/entities/api/uid-register.service';
import { COUNTRIES } from '@/shared/constants/constants';
import { I18nDirective, I18nService } from '@/shared/i18n';
import { AuthService, UserData } from '@/shared/lib/auth';
import { getFormControl } from '@/shared/lib/form.helper';
import { AgridataAvatarComponent, AvatarSize, AvatarSkin } from '@/shared/ui/agridata-avatar';
import { AgridataInputComponent } from '@/shared/ui/agridata-input';
import { ButtonComponent, ButtonVariants } from '@/shared/ui/button';
import { FormControlComponent } from '@/shared/ui/form-control';
import { ControlTypes } from '@/shared/ui/form-control/form-control.model';

@Component({
  selector: 'app-data-request-form-consumer',
  imports: [
    ReactiveFormsModule,
    I18nDirective,
    FormControlComponent,
    AgridataInputComponent,
    ButtonComponent,
    AgridataAvatarComponent,
  ],
  templateUrl: './data-request-form-consumer.component.html',
})
export class DataRequestFormConsumerComponent {
  readonly i18nService = inject(I18nService);
  readonly authService = inject(AuthService);
  readonly uidSearchService = inject(UidRegisterService);

  readonly form = input<FormGroup>();
  readonly dataRequestLogo = input<string>();
  readonly saveLogo = output<File>();

  readonly ControlTypes = ControlTypes;
  readonly ButtonVariants = ButtonVariants;
  readonly AvatarSize = AvatarSize;
  readonly AvatarSkin = AvatarSkin;
  readonly getFormControl = getFormControl;
  readonly uidInfoResource = this.uidSearchService.uidInfosOfCurrentUser;

  readonly userData = signal<UserData | null>(this.authService.userData());
  readonly consumerName = signal<string>('');
  readonly logoFile = signal<File | null>(null);
  readonly logoErrorMessage = signal<string | null>(null);

  readonly countries = computed(() => {
    return Object.entries(COUNTRIES).map(([key, value]) => {
      return {
        label: this.i18nService.translate(`countries.${key}`),
        value: value,
      };
    });
  });

  readonly logoPreviewUrl = computed(() => {
    const file = this.logoFile();
    if (file) {
      return URL.createObjectURL(file);
    }
    return this.dataRequestLogo();
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
      this.consumerName.set(newUserData.name);

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

  handleChangeConsumerInitials(event: Event) {
    const name = (event.target as HTMLInputElement).value;
    this.consumerName.set(name);
  }

  onFileSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) {
      return;
    }
    const MAX_SIZE = 100 * 1024; // 100kB
    if (file.size > MAX_SIZE) {
      this.logoErrorMessage.set(
        this.i18nService.translate('data-request.form.consumer.logo.error.size', {
          maxSize: this.formatBytes(MAX_SIZE),
        }),
      );
      return;
    } else {
      this.logoErrorMessage.set(null);
    }
    this.logoFile.set(file);
    this.saveLogo.emit(file);
  }

  private formatBytes(bytes: number): string {
    if (bytes < 1024) return `${bytes}B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)}kB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)}MB`;
  }
}
