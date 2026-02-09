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
 * CommentLastReviewed: 2026-02-09
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
  protected readonly productDataLink = `${environment.appBaseUrl}/cms/data-consumer#dataProduct`;
  protected readonly faSpinnerThird = faSpinnerThird;

  // Input properties
  readonly dataProviderId = input<string | undefined>();
  readonly form = input<FormGroup>();
  readonly formDisabled = input<boolean>(false);

  // Signals
  protected readonly selectedCategory = signal<string | null>(null);
  protected readonly selectedProviderId = signal<string | null>(null);

  // Computed Signals
  protected readonly allSystemsLabel = computed(() =>
    this.i18nService.translate('data-request.form.products.allSystems'),
  );

  protected readonly dataProducts = computed(() =>
    this.metaDataService.getProductsForProvider(this.selectedProviderId() ?? undefined),
  );

  protected readonly uniqueCategories = computed(() => {
    const products = this.dataProducts();
    const categories = products
      .map((p) => p.dataSourceSystemCode)
      .filter((c): c is string => typeof c === 'string' && c.length > 0);
    return [...new Set(categories)];
  });

  protected readonly dataProductsCategories = computed(() => {
    const categories = this.uniqueCategories();
    const options = categories.map((category) => ({
      label: category,
      value: category,
    }));

    if (categories.length <= 1) {
      return options;
    }

    return [{ label: this.allSystemsLabel(), value: null }, ...options];
  });

  protected readonly dataProviderOptions = computed(() =>
    this.metaDataService.dataProviders().map((provider) => ({
      label: provider.name?.[this.i18nService.lang() as keyof typeof provider.name] ?? provider.id,
      value: provider.id,
    })),
  );

  protected readonly productsGrouped = computed<MultiSelectCategory[]>(() => {
    const selectedCat = this.selectedCategory();
    const allProducts = this.dataProducts();
    const categories = this.uniqueCategories();

    if (selectedCat === null) {
      return categories.map((category) => ({
        categoryLabel: category,
        options: allProducts
          .filter((product) => product.dataSourceSystemCode === category)
          .map((product) => this.mapProductToOption(product)),
      }));
    }

    return [
      {
        categoryLabel: selectedCat,
        options: allProducts
          .filter((product) => product.dataSourceSystemCode === selectedCat)
          .map((product) => this.mapProductToOption(product)),
      },
    ];
  });

  protected readonly providerLoading = computed(() => this.metaDataService.isProvidersLoading());

  protected readonly productsLoading = computed(() =>
    this.metaDataService.isLoadingProductsByProvider(this.selectedProviderId() ?? undefined),
  );

  protected readonly showProducts = computed(() => {
    const providerId = this.selectedProviderId();
    return providerId !== null && !this.productsLoading();
  });

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

  private readonly initializeProviderFromInputEffect = effect(() => {
    const providerId = this.dataProviderId();
    if (providerId && this.selectedProviderId() !== providerId) {
      this.selectedProviderId.set(providerId);
    }
  });

  private readonly loadProductsEffect = effect(() => {
    const providerId = this.selectedProviderId();
    if (providerId) {
      this.metaDataService.fetchProductsByProvider(providerId);
    }
  });

  private readonly singleCategoryAutoSelectEffect = effect(() => {
    const categories = this.uniqueCategories();
    if (categories.length === 1 && this.selectedCategory() === null) {
      this.selectedCategory.set(categories[0]);
    }
  });

  private readonly singleProviderAutoSelectEffect = effect(() => {
    const providers = this.metaDataService.dataProviders();
    if (providers.length === 1 && this.selectedProviderId() === null) {
      this.selectedProviderId.set(providers[0].id);
    }
  });

  // Protected methods
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

  protected hasProductsError(): boolean {
    const control = getFormControl(this.form()!, 'request.products');
    return (control?.touched && control?.invalid) ?? false;
  }

  protected hasProviderError(): boolean {
    return this.selectedProviderId() === null && this.hasProductsError();
  }

  protected onCategoryChange(value: string | number | null): void {
    if (typeof value === 'string' || value === null) {
      this.selectedCategory.set(value);
    }
  }

  protected onProviderChange(value: string | number | null): void {
    // Clear products and category when user manually changes provider
    this.selectedCategory.set(null);
    const productsControl = getFormControl(this.form()!, 'request.products');
    productsControl?.setValue([]);

    if (typeof value === 'string') {
      this.selectedProviderId.set(value);
    } else {
      this.selectedProviderId.set(null);
    }
  }

  // Private methods
  private mapProductToOption(product: DataProductDto): { label: string; value: string } {
    return {
      label: product.name?.[this.i18nService.lang() as keyof typeof product.name] ?? '',
      value: product.id,
    };
  }
}
