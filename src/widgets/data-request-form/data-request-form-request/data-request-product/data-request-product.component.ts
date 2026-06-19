import { Component, computed, effect, inject, input, signal } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { faSpinnerThird } from '@awesome.me/kit-0b6d1ed528/icons/duotone/solid';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

import { MasterDataService } from '@/entities/api/master-data.service';
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

import {
  buildCategoriesMap,
  getDataSourceCode,
  mapProductToOption,
} from './data-request-product.model';

/**
 * Manages provider selection and product selection for a data request. Handles dynamic product
 * loading, category filtering, and validation feedback for the products form control.
 *
 * CommentLastReviewed: 2026-06-19
 */
@Component({
  selector: 'app-data-request-product',
  imports: [
    AgridataMultiSelectComponent,
    AgridataSelectComponent,
    FontAwesomeModule,
    FormControlComponent,
    I18nDirective,
    ReactiveFormsModule,
  ],
  templateUrl: './data-request-product.component.html',
})
export class DataRequestProductComponent {
  // Injects
  private readonly i18nService = inject(I18nService);
  private readonly metaDataService = inject(MasterDataService);

  // Constants
  protected readonly ControlTypes = ControlTypes;
  protected readonly faSpinnerThird = faSpinnerThird;
  protected readonly getFormControl = getFormControl;
  protected readonly productDataLink = `${environment.appBaseUrl}/cms/data-consumer#dataProduct`;

  // Input properties
  readonly dataProviderId = input<string>();
  readonly form = input<FormGroup>();
  readonly formDisabled = input<boolean>(false);

  // Signals
  protected readonly productsLoading = signal<boolean>(false);
  protected readonly selectedCategory = signal<string | null>(null);
  protected readonly selectedProviderId = signal<string>('');

  // Computed Signals
  protected readonly allSystemsLabel = computed(() =>
    this.i18nService.translate('data-request.form.products.allSystems'),
  );

  protected readonly dataProducts = computed(() => {
    const providerId = this.selectedProviderId();
    if (!providerId || this.productsLoading()) {
      return [];
    }
    return this.metaDataService.getProductsForProvider(providerId);
  });

  private readonly categoriesMap = computed(() =>
    buildCategoriesMap(this.dataProducts(), this.i18nService.lang()),
  );

  protected readonly dataProductsCategories = computed(() => {
    if (this.productsLoading()) {
      return [];
    }
    const categories = Array.from(this.categoriesMap().entries()).map(([value, label]) => ({
      label,
      value,
    }));
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
    const lang = this.i18nService.lang();
    const catMap = this.categoriesMap();

    const entries =
      selectedCat !== null
        ? [[selectedCat, catMap.get(selectedCat) ?? selectedCat] as [string, string]]
        : Array.from(catMap.entries());

    return entries.map(([code, name]) => ({
      categoryLabel: name,
      options: allProducts
        .filter((p) => getDataSourceCode(p) === code)
        .map((p) => mapProductToOption(p, lang)),
    }));
  });

  protected readonly showProducts = computed(() => this.selectedProviderId() !== '');

  protected readonly providersOptions = computed(() =>
    this.metaDataService.dataProviders().map((provider) => ({
      label: provider.name?.[this.i18nService.lang() as keyof typeof provider.name] ?? provider.id,
      value: provider.id,
    })),
  );

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
      return;
    }
    this.productsLoading.set(true);
    Promise.resolve().then(() => {
      this.metaDataService.fetchProductsByProvider(providerId);
      if (this.selectedProviderId() === providerId) {
        this.productsLoading.set(false);
      }
    });
  });

  private readonly singleCategoryAutoSelectEffect = effect(() => {
    const categories = this.dataProductsCategories();
    const products = this.dataProducts();
    const realCategories = categories.filter((cat) => cat.value !== null);
    if (products.length > 0 && realCategories.length === 1 && this.selectedCategory() == null) {
      this.selectedCategory.set(realCategories[0].value);
    }
  });

  private readonly syncProviderIdEffect = effect(() => {
    const providerId = this.dataProviderId();
    if (providerId && this.selectedProviderId() === '') {
      this.selectedProviderId.set(providerId);
    }
  });

  // Protected methods
  protected getProductsErrorMessage(): string | null {
    const control = getFormControl(this.form()!, 'request.products');
    if (control?.touched && control?.invalid && control.errors) {
      const errorKey = Object.keys(control.errors)[0];
      return getErrorMessage(control, errorKey);
    }
    return null;
  }

  protected hasProductsError(): boolean {
    const control = getFormControl(this.form()!, 'request.products');
    return (control?.touched && control?.invalid) ?? false;
  }

  protected hasProviderError(): boolean {
    return !this.selectedProviderId() && this.hasProductsError();
  }

  protected onCategoryChange(value: string | number | null): void {
    if (typeof value === 'string' || value === null) {
      this.selectedCategory.set(value);
    }
  }

  protected onProviderChange(value: string | number | null): void {
    this.selectedCategory.set(null);
    const productsControl = getFormControl(this.form()!, 'request.products');
    if (productsControl) {
      productsControl.setValue([]);
    }
    this.selectedProviderId.set(value as string);
  }
}
