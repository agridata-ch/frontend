import {
  Component,
  computed,
  effect,
  inject,
  input,
  output,
  resource,
  signal,
} from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';

import { UidRegisterService } from '@/entities/api/uid-register.service';
import { DataRequestConsumerDisplayNameDto } from '@/entities/openapi';
import { COUNTRIES } from '@/shared/constants/constants';
import { ErrorHandlerService } from '@/shared/error/error-handler.service';
import { I18nDirective, I18nService } from '@/shared/i18n';
import { createResourceErrorHandlerEffect } from '@/shared/lib/api.helper';
import { AuthService } from '@/shared/lib/auth';
import { getFormControl } from '@/shared/lib/form.helper';
import { AgridataAvatarComponent, AvatarSize, AvatarSkin } from '@/shared/ui/agridata-avatar';
import { AgridataInputComponent } from '@/shared/ui/agridata-input';
import { ButtonComponent, ButtonVariants } from '@/shared/ui/button';
import { FormControlComponent } from '@/shared/ui/form-control';
import { ControlTypes } from '@/shared/ui/form-control/form-control.model';
import { formatBytes } from '@/shared/utils';

import { availableLangs } from '../../../../transloco.config';

/**
 * Implements the logic for filling consumer information such as name, UID, address, and contact
 * details. It integrates authentication data, UID registry lookups, and country lists. It supports
 * uploading a consumer logo and patches missing information into the form dynamically.
 *
 * CommentLastReviewed: 2025-08-25
 */
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
  readonly errorService = inject(ErrorHandlerService);

  readonly form = input<FormGroup>();
  readonly formDisabled = input<boolean>(false);
  readonly dataRequestLogo = input<string>();

  readonly saveLogo = output<File>();

  readonly ControlTypes = ControlTypes;
  readonly ButtonVariants = ButtonVariants;
  readonly AvatarSize = AvatarSize;
  readonly AvatarSkin = AvatarSkin;
  readonly availableLangs = availableLangs;
  readonly getFormControl = getFormControl;
  readonly uidInfoResource = resource({
    loader: () => this.uidSearchService.fetchUidInfosOfCurrentUser(),
  });
  private readonly uidInfoResourceErrorHandler = createResourceErrorHandlerEffect(
    this.uidInfoResource,
    this.errorService,
  );
  readonly userInfo = this.authService.userInfo;
  readonly consumerName = signal<string>('');
  readonly consumerDisplayNames = signal<DataRequestConsumerDisplayNameDto>({});
  readonly consumerUid = signal<string | undefined>(undefined);
  readonly logoFile = signal<File | null>(null);
  readonly logoErrorMessage = signal<string | null>(null);

  readonly countries = computed(() => {
    const regionNames = new Intl.DisplayNames([this.i18nService.lang()], { type: 'region' });
    return Object.values(COUNTRIES).map((value) => ({
      label: regionNames.of(value) ?? value,
      value,
    }));
  });

  readonly consumerDisplayName = computed(() => {
    const names = this.consumerDisplayNames();
    return this.i18nService.useObjectTranslation(names) || names.de || names.fr || names.it || '';
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

    const uidSearchResult = this.uidInfoResource.error() ? null : this.uidInfoResource.value();
    const currentUserData = this.userInfo();
    const userFullName = this.userFullName();

    // Always proceed with available data - either from UID resource or user data
    // Skip only if we already have the correct legal name
    if (uidSearchResult?.legalName === userFullName && !this.uidInfoResource.error()) return;

    const newUserData = {
      ...currentUserData,
      uid: uidSearchResult?.uid || currentUserData?.uid,
      name: uidSearchResult?.legalName || userFullName,
    };

    this.consumerUid.set(newUserData.uid);

    this.consumerName.set(newUserData.name || '');

    // check for value in form, if no values exist, patch the form with the request stuff.
    // dataConsumerDisplayName is a nested {de,fr,it} group, so check leaf values instead of
    // the sub-object (which would always be truthy).
    const currentFormData = this.form()?.get('consumer')?.value ?? {};
    const hasAnyValue = Object.values(currentFormData).some((value) =>
      value && typeof value === 'object' ? Object.values(value).some(Boolean) : Boolean(value),
    );
    if (!hasAnyValue) {
      // The UID register has a single legal name, so prefill it into every language.
      this.form()?.patchValue({
        consumer: {
          dataConsumerDisplayName: {
            de: newUserData.name,
            fr: newUserData.name,
            it: newUserData.name,
          },
          dataConsumerCity: uidSearchResult?.address?.city,
          dataConsumerZip: uidSearchResult?.address?.zip,
          dataConsumerStreet: uidSearchResult?.address?.street,
          dataConsumerCountry: uidSearchResult?.address?.country,
        },
      });
    }
    this.consumerDisplayNames.set(
      this.form()?.get('consumer.dataConsumerDisplayName')?.value ?? {},
    );
  });

  handleChangeConsumerInitials(lang: string, event: Event) {
    const name = (event.target as HTMLInputElement).value;
    this.consumerDisplayNames.update((names) => ({ ...names, [lang]: name }));
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
          maxSize: formatBytes(MAX_SIZE),
        }),
      );
      return;
    } else {
      this.logoErrorMessage.set(null);
    }
    this.logoFile.set(file);
    this.saveLogo.emit(file);
  }
}
