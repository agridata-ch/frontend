import { Location } from '@angular/common';
import {
  afterNextRender,
  Component,
  computed,
  effect,
  inject,
  input,
  resource,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormGroup } from '@angular/forms';
import { Router } from '@angular/router';

import { DataProductUpdateDto as DataProductUpdateDtoSchema } from '@/assets/formSchemas/agridata-schemas.json';
import { AgridataStateService } from '@/entities/api/agridata-state.service';
import { DataProductService } from '@/entities/api/data-product.service';
import { DataProductDto, DataProductDtoStateCode } from '@/entities/openapi';
import { ROUTE_PATHS } from '@/shared/constants/constants';
import { I18nDirective, I18nService } from '@/shared/i18n';
import { buildReactiveForm } from '@/shared/lib/form.helper';
import { ScrollFadeDirective } from '@/shared/scroll-fade';
import { SidepanelComponent } from '@/shared/sidepanel';
import { ToastService, ToastType } from '@/shared/toast';
import { AgridataTabsComponent, Tab } from '@/shared/ui/agridata-tabs';
import { ButtonComponent, ButtonVariants } from '@/shared/ui/button';

import {
  buildDataProductPayload,
  DATA_PRODUCT_NEW_ID,
  dataProductFormsModel,
  FORCE_RELOAD_DATA_PRODUCTS_STATE_PARAM,
  FORM_TAB_IDS,
} from './data-product-detail-form.model';
import { DataProductDetailInfoComponent } from './data-product-detail-info';
import { DataProductDetailTechnicalComponent } from './data-product-detail-technical';

/**
 * Side panel for creating and editing a data product.
 * Handles its own API calls and navigates back to the list when done.
 *
 * CommentLastReviewed: 2026-06-09
 */
@Component({
  selector: 'app-data-product-detail-form',
  imports: [
    AgridataTabsComponent,
    ButtonComponent,
    DataProductDetailInfoComponent,
    DataProductDetailTechnicalComponent,
    I18nDirective,
    ScrollFadeDirective,
    SidepanelComponent,
  ],
  templateUrl: './data-product-detail-form.component.html',
})
export class DataProductDetailFormComponent {
  // Injects
  private readonly dataProductService = inject(DataProductService);
  private readonly i18nService = inject(I18nService);
  private readonly location = inject(Location);
  private readonly router = inject(Router);
  private readonly stateService = inject(AgridataStateService);
  private readonly toastService = inject(ToastService);

  // Constants
  protected readonly ButtonVariants = ButtonVariants;
  protected readonly FORM_TAB_IDS = FORM_TAB_IDS;

  // Input properties
  readonly dataProductId = input<string | undefined>();

  // Signals
  protected readonly activeTabId = signal<string>(FORM_TAB_IDS.NAME_AND_DESCRIPTION);
  protected readonly isOpen = signal(false);
  protected readonly isSaving = signal(false);
  private readonly currentDataProductId = signal<string | null>(null);
  private readonly publishAttempted = signal(false);
  private readonly refreshListNeeded = signal(false);

  protected readonly form = buildReactiveForm(
    DataProductUpdateDtoSchema,
    dataProductFormsModel,
    this.i18nService,
  );

  // Computed Signals
  private readonly formStatusVersion = (() => {
    const version = signal(0);
    this.form.statusChanges
      .pipe(takeUntilDestroyed())
      .subscribe(() => version.update((v) => v + 1));
    return version;
  })();

  protected readonly tabs = computed<Tab[]>(() => {
    this.formStatusVersion(); // increments on every statusChanges emission, forcing recomputation
    const attempted = this.publishAttempted();
    return [
      {
        id: FORM_TAB_IDS.NAME_AND_DESCRIPTION,
        label: this.i18nService.translate('data-products.detailForm.tab.nameAndDescription'),
        hasError: attempted && (this.form.get(FORM_TAB_IDS.NAME_AND_DESCRIPTION)?.invalid ?? false),
      },
      {
        id: FORM_TAB_IDS.TECHNICAL_FIELDS,
        label: this.i18nService.translate('data-products.detailForm.tab.technicalFields'),
        hasError: attempted && (this.form.get(FORM_TAB_IDS.TECHNICAL_FIELDS)?.invalid ?? false),
      },
    ];
  });

  private readonly dataProductResource = resource({
    params: () => this.currentDataProductId(),
    loader: async ({ params: id }): Promise<DataProductDto | undefined> => {
      if (!id) return undefined;
      // TODO: implement once getDataProductById is available in DataProductService
      return undefined;
    },
  });

  // Effects
  private readonly openAfterRender = afterNextRender(() => this.isOpen.set(true));

  private readonly syncRouteIdEffect = effect(() => {
    const id = this.dataProductId();
    if (id && id !== DATA_PRODUCT_NEW_ID) {
      this.currentDataProductId.set(id);
    }
  });

  protected getTabForm(tabId: string): FormGroup {
    return this.form.get(tabId) as FormGroup;
  }

  protected cancel(): void {
    this.navigateToList(this.refreshListNeeded());
  }

  protected navigateToList(refresh: boolean): void {
    this.router.navigate([ROUTE_PATHS.DATA_PRODUCTS_PATH], {
      state: { [FORCE_RELOAD_DATA_PRODUCTS_STATE_PARAM]: refresh },
    });
  }

  protected async saveDraft(): Promise<void> {
    return this.save(false);
  }

  protected async saveAndPublish(): Promise<void> {
    return this.save(true);
  }

  private async save(publish: boolean): Promise<void> {
    if (publish) {
      this.publishAttempted.set(true);
      this.form.markAllAsTouched();
      if (!this.form.valid) return;
    }

    this.isSaving.set(true);
    try {
      const existingId = this.currentDataProductId();
      const payload = buildDataProductPayload(this.form as FormGroup);
      const saved = await (existingId
        ? this.dataProductService.updateDataProduct(
            existingId,
            payload,
            this.stateService.actingRole(),
          )
        : this.dataProductService.createDataProduct(payload, this.stateService.actingRole()));

      if (publish) {
        await this.dataProductService.setDataProductStatus(
          saved.id,
          JSON.stringify(DataProductDtoStateCode.Active),
          this.stateService.actingRole(),
        );
        this.toastService.show(
          this.i18nService.translate('data-products.saveAndPublish.success.title'),
          this.i18nService.translate('data-products.saveAndPublish.success.message'),
          ToastType.Success,
        );
        this.navigateToList(true);
      } else {
        this.currentDataProductId.set(saved.id);
        this.location.replaceState(`${ROUTE_PATHS.DATA_PRODUCTS_PATH}/${saved.id}`);
        this.toastService.show(
          this.i18nService.translate('data-products.saveDraft.success.title'),
          this.i18nService.translate('data-products.saveDraft.success.message'),
          ToastType.Success,
        );
        this.refreshListNeeded.set(true);
      }
    } catch {
      const key = publish ? 'saveAndPublish' : 'saveDraft';
      this.toastService.show(
        this.i18nService.translate(`data-products.${key}.error.title`),
        this.i18nService.translate(`data-products.${key}.error.message`),
        ToastType.Error,
      );
    } finally {
      this.isSaving.set(false);
    }
  }
}
