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
import { ViewSectionDirective } from '@/shared/view-section';

import { FLOW_CODE_OPTIONS, METHOD_CODE_OPTIONS } from '../data-product-detail-form.model';

/**
 * Tab component for the technical configuration fields of a data product.
 *
 * CommentLastReviewed: 2026-06-09
 */
@Component({
  selector: 'app-data-product-detail-technical',
  imports: [FormControlComponent, I18nDirective, AgridataSelectComponent, ViewSectionDirective],
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
  protected readonly ControlTypes = ControlTypes;
  protected readonly flowCodeOptions = FLOW_CODE_OPTIONS;
  protected readonly methodCodeOptions = METHOD_CODE_OPTIONS;

  // Input properties
  readonly form = input.required<FormGroup>();
  readonly isViewMode = input<boolean>(false);
  readonly preselectedProviderId = input<string>('');

  // Signals
  protected readonly selectedProviderId = signal<string>('');

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

  // Effects
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
