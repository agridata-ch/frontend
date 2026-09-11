import { Component, computed, effect, inject, input, resource, signal } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';

import { AgridataStateService } from '@/entities/api/agridata-state.service';
import { DataProvidersService } from '@/entities/api/data-providers.service';
import { MasterDataService } from '@/entities/api/master-data.service';
import { I18nDirective, I18nService } from '@/shared/i18n';
import { AuthService } from '@/shared/lib/auth';
import {
  createFormControl,
  FormControlWithMessages,
  getFormControl,
} from '@/shared/lib/form.helper';
import { AlertComponent, AlertType } from '@/shared/ui/alert';
import { ControlTypes, FormControlComponent } from '@/shared/ui/form-control';
import { LinkedTextComponent } from '@/shared/ui/linked-text';
import { parseLinkedText } from '@/shared/utils';
import { ViewSectionDirective } from '@/shared/view-section';

import { FLOW_CODE_OPTIONS, METHOD_CODE_OPTIONS } from '../data-product-detail-form.model';

/**
 * Tab component for the technical configuration fields of a data product.
 *
 * CommentLastReviewed: 2026-09-07
 */
@Component({
  selector: 'app-data-product-detail-technical',
  imports: [
    FormControlComponent,
    I18nDirective,
    LinkedTextComponent,
    ViewSectionDirective,
    AlertComponent,
  ],
  templateUrl: './data-product-detail-technical.component.html',
  host: { class: 'contents' },
})
export class DataProductDetailTechnicalComponent {
  // Injects

  private readonly authService = inject(AuthService);
  private readonly dataProvidersService = inject(DataProvidersService);
  private readonly i18nService = inject(I18nService);
  private readonly masterDataService = inject(MasterDataService);
  private readonly stateService = inject(AgridataStateService);

  // Constants
  protected readonly AlertType = AlertType;
  protected readonly ControlTypes = ControlTypes;
  protected readonly flowCodeOptions = FLOW_CODE_OPTIONS;
  protected readonly methodCodeOptions = METHOD_CODE_OPTIONS;

  // Input properties
  readonly form = input.required<FormGroup>();
  readonly isEditMode = input<boolean>(false);
  readonly isViewMode = input<boolean>(false);
  readonly preselectedProviderId = input<string>('');

  // Signals
  protected readonly selectedProviderId = signal<string>('');
  // control.disabled is a plain property, so reading it in the template is not reactive under
  // zoneless change detection. The parent disables the control via control.disable() (which emits
  // on control.events), so feed this signal from that stream to keep the locked-info alert in sync.
  protected readonly dataSourceSystemDisabled = signal(false);
  // 'provider' is UI-only and added to the form dynamically
  // keep the control in a signal so the teemplate reacts to it being added
  protected readonly providerControl = signal<FormControlWithMessages | undefined>(undefined);

  // Computed Signals
  protected readonly isAdmin = computed(() => this.authService.isAdmin());
  protected readonly dataSourceOptions = computed(() =>
    this.dataSourceSystems().map((system) => ({
      label: this.i18nService.useObjectTranslation(system.name) || system.code || system.id,
      value: system.id,
    })),
  );
  private readonly dataSourceSystems = computed(
    () =>
      (this.providerDataResource.isLoading() ? [] : this.providerDataResource.value()?.systems) ??
      [],
  );
  protected readonly dataSourceSystemDisabledMessageParts = computed(() =>
    parseLinkedText(
      this.i18nService.translate(
        'data-products.detailForm.dataSourceSystemId.disabledInfo.message',
      ),
    ),
  );
  protected readonly providerOptions = computed(() =>
    this.masterDataService.dataProviders().map((provider) => ({
      label: this.i18nService.useObjectTranslation(provider.name) || provider.id,
      value: provider.id,
    })),
  );
  protected readonly restClientOptions = computed(() =>
    this.restClients().map((client) => ({
      label: `${client.displayName} (${client.url})`,
      value: client.id ?? '',
    })),
  );
  private readonly restClients = computed(
    () =>
      (this.providerDataResource.isLoading() ? [] : this.providerDataResource.value()?.clients) ??
      [],
  );

  private readonly providerDataResource = resource({
    params: () => this.selectedProviderId() || undefined,
    loader: async ({ params: providerId }) => {
      const [systems, clients] = await Promise.all([
        this.dataProvidersService.getDataSourceSystems(providerId, this.stateService.actingRole()),
        this.dataProvidersService.getRestClients(providerId, this.stateService.actingRole()),
      ]);
      return { systems, clients };
    },
  });

  // Prevents syncSelectedProviderIdEffect from reacting to programmatic
  // changes made by syncProviderControlEffect.
  private isSyncingProviderControl = false;

  // Effects
  private readonly initProviderControlEffect = effect(() => {
    const form = this.form();
    if (form.get('provider')) return;

    const control = createFormControl('', [Validators.required], {
      required: () => this.i18nService.translate('forms.error.required'),
    });
    form.addControl('provider', control);
    this.providerControl.set(control);
  });

  private readonly syncProviderControlEffect = effect(() => {
    const control = this.providerControl();
    const providerId = this.selectedProviderId();
    if (!control || control.value === providerId) return;

    this.isSyncingProviderControl = true;
    control.setValue(providerId);
    this.isSyncingProviderControl = false;
  });

  private readonly syncSelectedProviderIdEffect = effect((onCleanup) => {
    const control = this.providerControl();
    if (!control) return;

    const subscription = control.valueChanges.subscribe((value) => {
      if (this.isSyncingProviderControl) return;
      this.onProviderChange(value);
    });
    onCleanup(() => subscription.unsubscribe());
  });

  private readonly syncDataSourceDisabledEffect = effect((onCleanup) => {
    const control = this.form().get('dataSourceSystemId');
    const update = () => this.dataSourceSystemDisabled.set(control?.disabled ?? false);
    update();
    const subscription = control?.events.subscribe(update);
    onCleanup(() => subscription?.unsubscribe());
  });

  private readonly applyPreselectedProviderEffect = effect(() => {
    const preselected = this.preselectedProviderId();
    if (preselected && !this.selectedProviderId()) {
      this.selectedProviderId.set(preselected);
    }
  });

  private readonly resolveProviderEffect = effect(() => {
    const providers = this.masterDataService.dataProviders();
    if (this.isAdmin() || !providers.length) return;

    const uid = this.authService.userInfo()?.uid;
    if (!uid) return;

    const ownProvider = providers.find((provider) => provider.uid === uid);
    if (!ownProvider) return;

    this.selectedProviderId.set(ownProvider.id);
  });

  // Methods
  protected getFormControl(path: string) {
    return getFormControl(this.form(), path);
  }

  protected onProviderChange(value: string | number | null): void {
    this.selectedProviderId.set(value?.toString() ?? '');
    this.getFormControl('dataSourceSystemId').setValue('');
    this.getFormControl('restClientId').setValue('');
  }
}
