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
  readonly formDisabled = input<boolean>(false);
  readonly dataRequestLogo = input<string>();

  readonly saveLogo = output<File>();

  readonly ControlTypes = ControlTypes;
  readonly ButtonVariants = ButtonVariants;
  readonly AvatarSize = AvatarSize;
  readonly AvatarSkin = AvatarSkin;
  readonly getFormControl = getFormControl;
  readonly uidInfoResource = this.uidSearchService.fetchUidInfosOfCurrentUser;

  readonly userData = signal<UserData | null>(this.authService.userData());
  readonly consumerName = signal<string>('');
  readonly consumerUid = signal<number | undefined>(undefined);
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

  protected readonly userFullName = computed(() => {
    return this.authService.getUserFullName();
  });

  readonly updateFormEffect = effect(async () => {
    if (this.uidInfoResource.isLoading()) return;

    const uidSearchResult = this.uidInfoResource.value();
    const currentUserData = this.userData();

    if (uidSearchResult || currentUserData) {
      if (uidSearchResult?.legalName === this.userFullName()) return;

      const newUserData = {
        ...currentUserData,
        uid: uidSearchResult?.uid || currentUserData?.uid,
        name: uidSearchResult?.legalName || this.userFullName(),
      };
      this.consumerUid.set(
        typeof newUserData.uid === 'string' ? Number(newUserData.uid) : newUserData.uid,
      );
      this.consumerName.set(newUserData.name);

      // check for value in form, if no values exist, patch the form with the request stuff
      const currentFormData = this.form()?.get('consumer')?.value;
      if (!Object.values(currentFormData).some(Boolean)) {
        this.form()?.patchValue({
          consumer: {
            dataConsumerDisplayName: uidSearchResult?.legalName,
            dataConsumerCity: uidSearchResult?.address?.city,
            dataConsumerZip: uidSearchResult?.address?.zip,
            dataConsumerStreet: uidSearchResult?.address?.street,
            dataConsumerCountry: uidSearchResult?.address?.country,
          },
        });
      }
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
