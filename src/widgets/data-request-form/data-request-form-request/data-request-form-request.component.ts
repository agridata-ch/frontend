import { Component, computed, effect, inject, input, signal } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { faSpinnerThird } from '@awesome.me/kit-0b6d1ed528/icons/duotone/solid';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

import { MasterDataService } from '@/entities/api/master-data.service';
import { DataProductDto } from '@/entities/openapi';
import { environment } from '@/environments/environment';
import { I18nDirective, I18nService } from '@/shared/i18n';
import { getErrorMessage, getFormControl } from '@/shared/lib/form.helper';
import {
  AgridataMultiSelectComponent,
  MultiSelectCategory,
} from '@/shared/ui/agridata-multi-select';
import { AgridataSelectComponent } from '@/shared/ui/agridata-select';
import { FormControlComponent } from '@/shared/ui/form-control';
import { ControlTypes } from '@/shared/ui/form-control/form-control.model';

/**
 * Implements the logic for managing request metadata. It fetches available products, maps them
 * into selectable options, and provides form controls for multilingual titles, descriptions,
 * and purposes.
 *
 * CommentLastReviewed: 2025-02-03
 */
@Component({
  selector: 'app-data-request-form-request',
  imports: [
    AgridataSelectComponent,
    FormControlComponent,
    I18nDirective,
    ReactiveFormsModule,
    AgridataMultiSelectComponent,
    FontAwesomeModule,
  ],
  templateUrl: './data-request-form-request.component.html',
})
export class DataRequestFormRequestComponent {
  // Injects
  private readonly i18nService = inject(I18nService);
  private readonly metaDataService = inject(MasterDataService);

  // Constants
  protected readonly ControlTypes = ControlTypes;
  protected readonly getFormControl = getFormControl;
  protected readonly faSpinnerThird = faSpinnerThird;
  protected readonly productDataLink = `${environment.appBaseUrl}/cms/data-consumer#dataProduct`;

  // Input properties
  readonly form = input<FormGroup>();
  readonly formDisabled = input<boolean>(false);
  readonly dataProviderId = input<string>();

  // Signals
  protected readonly selectedCategory = signal<string | null>(null);
  protected readonly selectedProviderId = signal<string>('');
  protected readonly productsLoading = signal<boolean>(false);
  private readonly loadingProviderId = signal<string | null>(null);
  protected readonly providerLoading = signal<boolean>(false);

  // Computed Signals
  protected readonly allSystemsLabel = computed(() =>
    this.i18nService.translate('data-request.form.products.allSystems'),
  );

  protected readonly providersOptions = computed(() => {
    const providers = this.metaDataService.dataProviders();
    return providers.map((provider) => ({
      label: provider.name?.[this.i18nService.lang() as keyof typeof provider.name] ?? provider.id,
      value: provider.id,
    }));
  });

  protected readonly dataProducts = computed(() => {
    const providerId = this.selectedProviderId();
    if (!providerId || this.productsLoading()) {
      return [];
    }
    return this.metaDataService.getProductsForProvider(providerId);
  });

  protected readonly dataProductsCategories = computed(() => {
    if (this.productsLoading()) {
      return [];
    }
    // Get unique categories by code
    const categoriesMap = new Map<string, { value: string; label: string }>();
    for (const product of this.dataProducts()) {
      const code = product.dataSourceSystem?.code ?? product.dataSourceSystemCode ?? '';
      if (!code) continue;
      const name =
        product.dataSourceSystem?.name?.[
          this.i18nService.lang() as keyof typeof product.dataSourceSystem.name
        ] ?? code;
      if (!categoriesMap.has(code)) {
        categoriesMap.set(code, { value: code, label: name });
      }
    }
    const categories = Array.from(categoriesMap.values());
    if (categories.length <= 1) {
      return categories;
    }
    return [{ label: this.allSystemsLabel(), value: null }, ...categories];
  });

  protected readonly productsGrouped = computed<MultiSelectCategory[]>(() => {
    if (this.productsLoading()) {
      return [];
    }
    const selectedCat = this.selectedCategory();
    const allProducts = this.dataProducts();
    // Get unique categories by code for grouping
    const categoriesMap = new Map<string, string>();
    for (const product of allProducts) {
      const code = product.dataSourceSystem?.code ?? product.dataSourceSystemCode ?? '';
      if (!code) continue;
      const name =
        product.dataSourceSystem?.name?.[
          this.i18nService.lang() as keyof typeof product.dataSourceSystem.name
        ] ?? code;
      if (!categoriesMap.has(code)) {
        categoriesMap.set(code, name);
      }
    }
    const categories = Array.from(categoriesMap.entries());

    if (selectedCat === null) {
      return categories.map(([code, name]) => ({
        categoryLabel: name,
        options: allProducts
          .filter(
            (product) => (product.dataSourceSystem?.code ?? product.dataSourceSystemCode) === code,
          )
          .map((product) => this.mapProductToOption(product)),
      }));
    }

    // Find the label for the selected category
    const selectedLabel = categoriesMap.get(selectedCat) ?? selectedCat;
    return [
      {
        categoryLabel: selectedLabel,
        options: allProducts
          .filter(
            (product) =>
              (product.dataSourceSystem?.code ?? product.dataSourceSystemCode) === selectedCat,
          )
          .map((product) => this.mapProductToOption(product)),
      },
    ];
  });

  protected readonly showProducts = computed(() => this.selectedProviderId() !== '');

  // Effects
  private readonly categoryChangeEffect = effect(() => {
    const category = this.selectedCategory();
    const productsControl = getFormControl(this.form()!, 'request.products');

    if (!productsControl || category === null) {
      return;
    }

    const currentProducts = (productsControl.value as string[]) ?? [];
    const allProducts = this.dataProducts();

    const validProducts = currentProducts.filter((id) =>
      allProducts.some((p) => p.id === id && p.dataSourceSystemCode === category),
    );

    if (validProducts.length !== currentProducts.length) {
      productsControl.setValue(validProducts);
    }
  });

  private readonly providerChangeEffect = effect(() => {
    const providerId = this.selectedProviderId();
    if (!providerId) {
      this.productsLoading.set(false);
      this.loadingProviderId.set(null);
      return;
    }
    this.productsLoading.set(true);
    this.loadingProviderId.set(providerId);
    Promise.resolve().then(() => {
      this.metaDataService.fetchProductsByProvider(providerId);
      // Simulate async: set loading to false after products are fetched (in real app, use callback or observable)
      setTimeout(() => {
        if (this.loadingProviderId() === providerId) {
          this.productsLoading.set(false);
        }
      }, 200); // adjust as needed for real fetch
    });
  });

  private readonly singleCategoryAutoSelectEffect = effect(() => {
    const categories = this.dataProductsCategories();
    const products = this.dataProducts();
    // Only auto-select if products are loaded and there is exactly one real category
    const realCategories = categories.filter((cat) => cat.value !== null);
    if (products.length > 0 && realCategories.length === 1 && this.selectedCategory() == null) {
      this.selectedCategory.set(realCategories[0].value);
    }
  });

  private readonly syncProviderIdEffect = effect(() => {
    const providerId = this.dataProviderId();
    // Only sync if still in initial state (empty), then allow user to change freely
    if (providerId && this.selectedProviderId() === '') {
      this.selectedProviderId.set(providerId);
    }
  });

  // Protected methods
  protected onCategoryChange(value: string | number | null): void {
    if (typeof value === 'string' || value === null) {
      this.selectedCategory.set(value);
    }
  }

  protected onProviderChange(value: string | number | null): void {
    // Clear category and products before changing provider
    this.selectedCategory.set(null);
    const productsControl = getFormControl(this.form()!, 'request.products');
    if (productsControl) {
      productsControl.setValue([]);
    }

    this.selectedProviderId.set(value as string);
  }

  protected hasProductsError(): boolean {
    const control = getFormControl(this.form()!, 'request.products');
    return (control?.touched && control?.invalid) ?? false;
  }

  protected hasProviderError(): boolean {
    return !this.selectedProviderId() && this.hasProductsError();
  }

  protected getProductsErrorMessage(): string | null {
    const control = getFormControl(this.form()!, 'request.products');
    if (control?.touched && control?.invalid) {
      const errors = control.errors;
      if (errors) {
        const errorKey = Object.keys(errors)[0];
        return getErrorMessage(control, errorKey);
      }
    }
    return null;
  }

  private mapProductToOption(product: DataProductDto): { label: string; value: string } {
    return {
      label: product.name?.[this.i18nService.lang() as keyof typeof product.name] ?? '',
      value: product.id,
    };
  }
}
