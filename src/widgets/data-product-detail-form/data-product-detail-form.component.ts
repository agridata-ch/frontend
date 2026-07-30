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
import { ACTING_ROLES, ROUTE_PATHS } from '@/shared/constants/constants';
import { I18nDirective, I18nFormatDirective, I18nService } from '@/shared/i18n';
import { buildReactiveForm, populateFormFromDto } from '@/shared/lib/form.helper';
import { ScrollFadeDirective } from '@/shared/scroll-fade';
import { SidepanelComponent } from '@/shared/sidepanel';
import { ToastService, ToastType } from '@/shared/toast';
import { AgridataTabsComponent, Tab } from '@/shared/ui/agridata-tabs';
import { AgridataBadgeComponent, BadgeSize } from '@/shared/ui/badge';
import { ButtonComponent, ButtonVariants } from '@/shared/ui/button';
import { ModalComponent } from '@/shared/ui/modal';
import { DocumentUploadStore } from '@/widgets/data-product-detail-form/data-product-detail-links-documents';

import {
  applyDisabledAfterPublish,
  buildDataProductPayload,
  DATA_PRODUCT_NEW_ID,
  dataProductFormsModel,
  FORCE_RELOAD_DATA_PRODUCTS_STATE_PARAM,
  FORM_TAB_IDS,
  SAVE_MODE,
} from './data-product-detail-form.model';
import { DataProductDetailInfoComponent } from './data-product-detail-info';
import { DataProductDetailLinksDocumentsComponent } from './data-product-detail-links-documents';
import { DataProductDetailTechnicalComponent } from './data-product-detail-technical';

/**
 * Side panel for creating and editing a data product.
 * Handles its own API calls and navigates back to the list when done.
 *
 * CommentLastReviewed: 2026-08-03
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
    I18nFormatDirective,
    ModalComponent,
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
  protected readonly showPublishModal = signal(false);
  protected readonly isEditMode = signal(false);
  private readonly currentDataProductId = signal<string | null>(null);
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
        // Only flag the tab as errored for actual document failures (rejected / scan error);
        // a pending scan is a transient, expected state and must not redden the tab.
        hasError:
          attempted &&
          ((this.form.get(FORM_TAB_IDS.LINKS_DOCUMENTS)?.invalid ?? false) ||
            this.uploadStore.hasBlockingState()),
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
    untracked(() => this.populateForm(product));
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

  // Locks the per-role fields while editing a published product. form-control reflects the control's
  // disabled state automatically, so no per-field [disabled] bindings are needed in the tabs.
  private readonly syncDisabledFieldsEffect = effect(() => {
    const editMode = this.isEditMode();
    const isAdmin = this.stateService.actingRole() === ACTING_ROLES.ADMIN;
    untracked(() => {
      applyDisabledAfterPublish(
        this.getTabForm(FORM_TAB_IDS.NAME_AND_DESCRIPTION),
        editMode,
        isAdmin,
      );
      applyDisabledAfterPublish(this.getTabForm(FORM_TAB_IDS.TECHNICAL_FIELDS), editMode, isAdmin);
    });
  });

  protected getTabForm(tabId: string): FormGroup {
    return this.form.get(tabId) as FormGroup;
  }

  protected cancel(): void {
    if (this.isEditMode()) {
      // Discard uncommitted edits: the component stays alive in edit mode, so restore the form and
      // documents to the loaded product before leaving edit mode.
      const product = this.dataProductResource.value();
      if (product) this.populateForm(product);
      const id = this.currentDataProductId();
      if (id) void this.uploadStore.loadExisting(id).catch(() => undefined);
      this.publishAttempted.set(false);
      this.isEditMode.set(false);
    } else {
      this.closeSidepanel();
    }
  }

  protected closeSidepanel(): void {
    this.navigateToList(this.refreshListNeeded());
  }

  protected enterEditMode(): void {
    this.isEditMode.set(true);
  }

  protected navigateToList(refresh: boolean): void {
    this.router.navigate([ROUTE_PATHS.DATA_PRODUCTS_PATH], {
      state: { [FORCE_RELOAD_DATA_PRODUCTS_STATE_PARAM]: refresh },
    });
  }

  protected async saveDraft(): Promise<void> {
    return this.save(SAVE_MODE.DRAFT);
  }

  protected saveAndPublish(): void {
    this.publishAttempted.set(true);
    this.form.markAllAsTouched();
    if (!this.form.valid) {
      this.scrollToFirstError();
      return;
    }
    this.showPublishModal.set(true);
  }

  protected cancelPublish(): void {
    this.showPublishModal.set(false);
  }

  protected async confirmPublish(): Promise<void> {
    this.showPublishModal.set(false);
    const saveKey = this.isEditMode() ? SAVE_MODE.EDIT : SAVE_MODE.PUBLISH;
    return this.save(saveKey);
  }

  protected async saveChanges(): Promise<void> {
    this.showPublishModal.set(true);
  }

  /**
   * Gates a save on form validity. Draft never gates; publish and edit require a valid form and
   * scroll to the first error when it is not. Extracted from `save()` to keep its cognitive
   * complexity under the Sonar limit.
   */
  private canSave(mode: string): boolean {
    if (mode === SAVE_MODE.DRAFT) return true;

    this.publishAttempted.set(true);
    this.form.markAllAsTouched();
    if (this.form.valid) return true;

    this.scrollToFirstError();
    return false;
  }

  /**
   * Waits for every running antivirus scan to reach its terminal state and reports whether all
   * documents ended up available. Only then is `hasUnreadyDocuments` meaningful: a document that was
   * merely still being scanned would otherwise read as unready.
   */
  private async documentsReady(): Promise<boolean> {
    await this.uploadStore.awaitPendingScans();
    return !this.uploadStore.hasUnreadyDocuments();
  }

  private populateForm(product: DataProductDto): void {
    populateFormFromDto(
      this.form,
      product as unknown as Record<string, unknown>,
      dataProductFormsModel,
    );
    const technicalGroup = this.getTabForm(FORM_TAB_IDS.TECHNICAL_FIELDS);
    technicalGroup.get('dataSourceSystemId')?.setValue(product.dataSourceSystem?.id ?? '');
    technicalGroup.get('restClientId')?.setValue(product.restClient?.id ?? '');
  }

  private async save(mode: string): Promise<void> {
    if (!this.canSave(mode)) return;

    const existingId = this.currentDataProductId();
    if (mode === SAVE_MODE.EDIT && !existingId) return;

    this.isSaving.set(true);
    try {
      // Editing a published product must not write while a document is unready, so the staged
      // documents are uploaded and their scans awaited before the PATCH. A new product cannot do
      // that: its id only exists after the POST, so there the documents follow the write and only
      // the publish (status change) is gated - an unready document leaves it a draft.
      if (mode === SAVE_MODE.EDIT && existingId) {
        await this.uploadStore.uploadAll(existingId);
        if (!(await this.documentsReady())) {
          this.reportUnreadyDocuments();
          return;
        }
      }

      const payload = buildDataProductPayload(this.form as FormGroup);
      const savedId = await this.persistPayload(mode, existingId, payload);

      if (mode !== SAVE_MODE.EDIT) {
        await this.uploadStore.uploadAll(savedId);
        // A draft may keep unready documents; publishing may not.
        if (mode === SAVE_MODE.PUBLISH && !(await this.documentsReady())) {
          this.reportUnreadyDocuments();
          return;
        }
      }

      // The deletes run last so an aborted save never removes a document; they still run after the
      // uploads, keeping the backend document count within the maximum.
      await this.uploadStore.commitRemovals(savedId);

      if (mode === SAVE_MODE.PUBLISH) {
        await this.dataProductService.setDataProductStatus(
          savedId,
          JSON.stringify(DataProductDtoStateCode.Active),
          this.stateService.actingRole(),
        );
      }

      this.showSaveToast(mode, true);
      // Draft stays on the form (the user may keep editing); publish/edit return to the list.
      if (mode !== SAVE_MODE.DRAFT) this.navigateToList(true);
    } catch {
      this.showSaveToast(mode, false);
    } finally {
      this.isSaving.set(false);
    }
  }

  private async persistPayload(
    mode: string,
    existingId: string | null,
    payload: Record<string, unknown>,
  ): Promise<string> {
    const actingRole = this.stateService.actingRole();

    // Editing a published product PATCHes only the changed/unlocked fields and keeps the URL.
    if (mode === SAVE_MODE.EDIT && existingId) {
      await this.dataProductService.patchDataProduct(existingId, payload, actingRole);
      return existingId;
    }

    const saved = await (existingId
      ? this.dataProductService.updateDataProduct(existingId, payload, actingRole)
      : this.dataProductService.createDataProduct(payload, actingRole));
    this.currentDataProductId.set(saved.id);
    this.location.replaceState(`${ROUTE_PATHS.DATA_PRODUCTS_PATH}/${saved.id}`);
    this.refreshListNeeded.set(true);
    return saved.id;
  }

  /**
   * Surfaces an aborted save caused by documents that could not be made available. `publishAttempted`
   * is already set and the remaining items are rejected or errored, so the documents tab shows its
   * error state once activated.
   */
  private reportUnreadyDocuments(): void {
    this.activeTabId.set(FORM_TAB_IDS.LINKS_DOCUMENTS);
    this.toastService.show(
      this.i18nService.translate('data-products.detailForm.documents.notReady.title'),
      this.i18nService.translate('data-products.detailForm.documents.notReady.message'),
      ToastType.Error,
    );
  }

  private showSaveToast(mode: string, success: boolean): void {
    let key: string;
    if (mode === SAVE_MODE.PUBLISH) {
      key = 'saveAndPublish';
    } else if (mode === SAVE_MODE.EDIT) {
      key = 'saveChanges';
    } else {
      key = 'saveDraft';
    }
    const state = success ? 'success' : 'error';
    this.toastService.show(
      this.i18nService.translate(`data-products.${key}.${state}.title`),
      this.i18nService.translate(`data-products.${key}.${state}.message`),
      success ? ToastType.Success : ToastType.Error,
    );
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
