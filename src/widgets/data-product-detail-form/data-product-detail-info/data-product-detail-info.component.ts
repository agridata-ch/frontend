import { Component, computed, effect, inject, input, resource, signal } from '@angular/core';
import { FormGroup } from '@angular/forms';

import { AgridataStateService } from '@/entities/api/agridata-state.service';
import { DataProvidersService } from '@/entities/api/data-providers.service';
import { MasterDataService } from '@/entities/api/master-data.service';
import { I18nDirective, I18nService } from '@/shared/i18n';
import { AuthService } from '@/shared/lib/auth';
import { getErrorMessage, getFormControl } from '@/shared/lib/form.helper';
import { AgridataSelectComponent } from '@/shared/ui/agridata-select';
import { ControlTypes, FormControlComponent } from '@/shared/ui/form-control';
import { AlertComponent, AlertType } from '@/widgets/alert';
import { METHOD_CODE_OPTIONS } from '@/widgets/data-product-detail-form/data-product-detail-form.model';

/**
 * Tab component for the system configuration and name/description fields of a data product.
 *
 * CommentLastReviewed: 2026-06-09
 */
@Component({
  selector: 'app-data-product-detail-info',
  imports: [AgridataSelectComponent, AlertComponent, FormControlComponent, I18nDirective],
  templateUrl: './data-product-detail-info.component.html',
  host: { class: 'contents' },
})
export class DataProductDetailInfoComponent {
  // Injects
  private readonly authService = inject(AuthService);
  private readonly dataProvidersService = inject(DataProvidersService);
  private readonly i18nService = inject(I18nService);
  private readonly masterDataService = inject(MasterDataService);
  private readonly stateService = inject(AgridataStateService);

  // Constants
  protected readonly AlertType = AlertType;
  protected readonly ControlTypes = ControlTypes;
  protected readonly methodCodeOptions = METHOD_CODE_OPTIONS;

  // Input properties
  readonly form = input.required<FormGroup>();

  // Signals
  protected readonly selectedProviderId = signal<string>('');

  // Computed Signals
  protected readonly dataSourceOptions = computed(() =>
    this.dataSourceSystems().map((system) => ({
      label: this.i18nService.useObjectTranslation(system.name) || system.code || system.id,
      value: system.id,
    })),
  );
  protected readonly isAdmin = computed(() => this.authService.isAdmin());
  protected readonly providerOptions = computed(() =>
    this.masterDataService.dataProviders().map((provider) => ({
      label: this.i18nService.useObjectTranslation(provider.name) || provider.id,
      value: provider.id,
    })),
  );
  protected readonly restClientOptions = computed(() =>
    this.restClients().map((client) => ({
      label: client.code ?? client.id ?? '',
      value: client.id ?? '',
    })),
  );
  private readonly dataSourceSystems = computed(
    () =>
      (this.providerDataResource.isLoading() ? [] : this.providerDataResource.value()?.systems) ??
      [],
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
        this.dataProvidersService.getDataSourceSystems(providerId),
        this.dataProvidersService.getRestClients(providerId),
      ]);
      return { systems, clients };
    },
  });

  // Effects
  private readonly resolveProviderEffect = effect(() => {
    const providers = this.masterDataService.dataProviders();
    if (this.isAdmin() || !providers.length) return;

    const activeUid = this.stateService.activeUid();
    const ownProvider = providers.find((provider) => provider.uid === activeUid) ?? providers[0];
    this.selectedProviderId.set(ownProvider.id);
  });

  protected getFormControl(path: string) {
    return getFormControl(this.form(), path);
  }

  protected onProviderChange(value: string | number | null): void {
    this.selectedProviderId.set(value?.toString() ?? '');
    this.getFormControl('dataSourceSystemId').setValue('');
    this.getFormControl('restClientId').setValue('');
  }

  protected get providerSelectErrorMessage(): string {
    const dss = this.getFormControl('dataSourceSystemId');
    const rc = this.getFormControl('restClientId');
    const ctrl = dss.invalid && dss.touched ? dss : rc;
    const firstKey = Object.keys(ctrl.errors ?? {})[0];
    if (!firstKey) return '';
    return getErrorMessage(ctrl, firstKey) ?? '';
  }

  protected get providerSelectHasError(): boolean {
    if (this.selectedProviderId()) return false;
    const dss = this.getFormControl('dataSourceSystemId');
    const rc = this.getFormControl('restClientId');
    return (dss.invalid && dss.touched) || (rc.invalid && rc.touched);
  }
}
