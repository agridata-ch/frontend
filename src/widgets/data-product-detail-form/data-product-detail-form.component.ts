import { Location } from '@angular/common';
import {
  afterNextRender,
  Component,
  computed,
  effect,
  ElementRef,
  inject,
  Injector,
  input,
  resource,
  signal,
  untracked,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { faSpinnerThird } from '@awesome.me/kit-0b6d1ed528/icons/duotone/solid';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

import { DataProductUpdateDto as DataProductUpdateDtoSchema } from '@/assets/formSchemas/agridata-schemas.json';
import { AgridataStateService } from '@/entities/api/agridata-state.service';
import { DataProductService } from '@/entities/api/data-product.service';
import { DataProductDto, DataProductDtoStateCode, DataProductStateEnum } from '@/entities/openapi';
import { getBadgeVariant, getStatusTranslation } from '@/pages/data-products-page';
import { ROUTE_PATHS } from '@/shared/constants/constants';
import { I18nDirective, I18nService } from '@/shared/i18n';
import { buildReactiveForm, populateFormFromDto } from '@/shared/lib/form.helper';
import { ScrollFadeDirective } from '@/shared/scroll-fade';
import { SidepanelComponent } from '@/shared/sidepanel';
import { ToastService, ToastType } from '@/shared/toast';
import { AgridataTabsComponent, Tab } from '@/shared/ui/agridata-tabs';
import { AgridataBadgeComponent, BadgeSize } from '@/shared/ui/badge';
import { ButtonComponent, ButtonVariants } from '@/shared/ui/button';
import { DocumentUploadStore } from '@/widgets/data-product-detail-form/data-product-detail-links-documents';

import {
  buildDataProductPayload,
  DATA_PRODUCT_NEW_ID,
  dataProductFormsModel,
  FORCE_RELOAD_DATA_PRODUCTS_STATE_PARAM,
  FORM_TAB_IDS,
} from './data-product-detail-form.model';
import { DataProductDetailInfoComponent } from './data-product-detail-info';
import { DataProductDetailLinksDocumentsComponent } from './data-product-detail-links-documents';
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
    FontAwesomeModule,
    I18nDirective,
    ScrollFadeDirective,
    SidepanelComponent,
    AgridataBadgeComponent,
    DataProductDetailLinksDocumentsComponent,
  ],
  templateUrl: './data-product-detail-form.component.html',
  providers: [DocumentUploadStore],
})
export class DataProductDetailFormComponent {
  // Injects
  protected readonly i18nService = inject(I18nService);
  private readonly dataProductService = inject(DataProductService);
  private readonly elementRef = inject(ElementRef);
  private readonly injector = inject(Injector);
  private readonly location = inject(Location);
  private readonly router = inject(Router);
  private readonly stateService = inject(AgridataStateService);
  private readonly toastService = inject(ToastService);
  private readonly uploadStore = inject(DocumentUploadStore);

  // Constants
  protected readonly BadgeSize = BadgeSize;
  protected readonly ButtonVariants = ButtonVariants;
  protected readonly faSpinnerThird = faSpinnerThird;
  protected readonly FORM_TAB_IDS = FORM_TAB_IDS;
  protected readonly getBadgeVariant = getBadgeVariant;
  protected readonly getStatusTranslation = getStatusTranslation;

  // Input properties
  readonly dataProductId = input<string | undefined>();

  // Signals
  protected readonly activeTabId = signal<string>(FORM_TAB_IDS.NAME_AND_DESCRIPTION);
  protected readonly isOpen = signal(false);
  protected readonly isSaving = signal(false);
  private readonly currentDataProductId = signal<string | null>(null);
  private readonly isEditMode = signal(false);
  private readonly publishAttempted = signal(false);
  private readonly refreshListNeeded = signal(false);

  protected readonly form = buildReactiveForm(
    DataProductUpdateDtoSchema,
    dataProductFormsModel,
    this.i18nService,
  );

  // Computed Signals
  protected readonly canSaveDraft = computed(
    () => this.stateCode() !== DataProductStateEnum.Active,
  );

  protected readonly dataProductTitle = computed(() =>
    this.i18nService.useObjectTranslation(this.dataProductResource.value()?.name),
  );

  protected readonly stateCode = computed(() => this.dataProductResource.value()?.stateCode);

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
      {
        id: FORM_TAB_IDS.LINKS_DOCUMENTS,
        label: this.i18nService.translate('data-products.detailForm.tab.linksAndDocuments'),
        hasError:
          attempted &&
          ((this.form.get(FORM_TAB_IDS.LINKS_DOCUMENTS)?.invalid ?? false) ||
            this.uploadStore.hasUnreadyDocuments()),
      },
    ];
  });

  protected readonly isViewMode = computed(() => {
    const product = this.dataProductResource.value();
    return product?.stateCode === DataProductDtoStateCode.Active && !this.isEditMode();
  });

  protected readonly preselectedProviderId = computed(
    () => this.dataProductResource.value()?.dataSourceSystem?.dataProvider?.id ?? '',
  );

  protected readonly sidepanelTitle = computed(() => {
    const id = this.dataProductId();
    if (!id) return '';

    if (id === DATA_PRODUCT_NEW_ID)
      return this.i18nService.translate('data-products.detailPanel.titleCreateNew');

    const dataProduct = this.dataProductResource.value();
    if (!dataProduct?.stateCode) return '';
    if (this.isViewMode()) return this.i18nService.useObjectTranslation(dataProduct.name);

    return this.i18nService.translate('data-products.detailPanel.titleUpdate');
  });

  protected readonly dataProductResource = resource({
    params: () => {
      const id = this.currentDataProductId();
      if (!id) return undefined;
      return { id, actingRole: this.stateService.actingRole() };
    },
    loader: async ({ params }): Promise<DataProductDto | undefined> => {
      return this.dataProductService.getDataProductById(params.id, params.actingRole);
    },
  });

  // Effects
  private readonly openAfterRender = afterNextRender(() => this.isOpen.set(true));

  private readonly patchFormEffect = effect(() => {
    const product = this.dataProductResource.value();
    if (!product) return;
    untracked(() => {
      populateFormFromDto(
        this.form,
        product as unknown as Record<string, unknown>,
        dataProductFormsModel,
      );
      const technicalGroup = this.getTabForm(FORM_TAB_IDS.TECHNICAL_FIELDS);
      technicalGroup.get('dataSourceSystemId')?.setValue(product.dataSourceSystem?.id ?? '');
      technicalGroup.get('restClientId')?.setValue(product.restClient?.id ?? '');
    });
  });

  private readonly syncRouteIdEffect = effect(() => {
    const id = this.dataProductId();
    if (id && id !== DATA_PRODUCT_NEW_ID) {
      this.currentDataProductId.set(id);
    }
  });

  private readonly loadDocumentsEffect = effect(() => {
    const id = this.dataProductId();
    if (id && id !== DATA_PRODUCT_NEW_ID) {
      // Swallow transient load errors here; the tab renders its own empty/list state regardless.
      untracked(() => this.uploadStore.loadExisting(id).catch(() => undefined));
    }
  });

  protected getTabForm(tabId: string): FormGroup {
    return this.form.get(tabId) as FormGroup;
  }

  protected cancel(): void {
    if (this.isEditMode()) {
      this.isEditMode.set(false);
    } else {
      this.closeSidepanel();
    }
  }

  protected closeSidepanel(): void {
    this.navigateToList(this.refreshListNeeded());
  }

  // TODO: enable it with edit mode DIGIB2-1354
  // protected enterEditMode(): void {
  //   this.isEditMode.set(true);
  // }

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
      if (!this.form.valid) {
        this.scrollToFirstError();
        return;
      }
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

      this.currentDataProductId.set(saved.id);
      this.location.replaceState(`${ROUTE_PATHS.DATA_PRODUCTS_PATH}/${saved.id}`);
      this.refreshListNeeded.set(true);

      // Upload the newly staged documents; existing untouched documents are skipped. This resolves
      // once the uploads are POSTed; the antivirus scan then runs in the background.
      await this.uploadStore.uploadAll(saved.id);

      // Commit the staged removals: documents the user marked for removal are deleted on save.
      await this.uploadStore.commitRemovals(saved.id);

      if (publish && this.uploadStore.hasUnreadyDocuments()) {
        this.activeTabId.set(FORM_TAB_IDS.LINKS_DOCUMENTS);
        return;
      }

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
        this.toastService.show(
          this.i18nService.translate('data-products.saveDraft.success.title'),
          this.i18nService.translate('data-products.saveDraft.success.message'),
          ToastType.Success,
        );
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

  private scrollToFirstError(): void {
    const tabOrder = [
      FORM_TAB_IDS.NAME_AND_DESCRIPTION,
      FORM_TAB_IDS.TECHNICAL_FIELDS,
      FORM_TAB_IDS.LINKS_DOCUMENTS,
    ];
    const targetTabId =
      tabOrder.find((tabId) => this.form.get(tabId)?.invalid) ?? FORM_TAB_IDS.NAME_AND_DESCRIPTION;

    this.activeTabId.set(targetTabId);

    afterNextRender(
      () => {
        const firstError = this.elementRef.nativeElement.querySelector(
          'app-form-control.has-error',
        );
        firstError?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      },
      { injector: this.injector },
    );
  }
}
