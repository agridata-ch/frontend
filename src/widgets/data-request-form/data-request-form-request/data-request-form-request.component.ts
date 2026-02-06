import { Component, computed, effect, inject, input, signal } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';

import { MasterDataService } from '@/entities/api/master-data.service';
import { environment } from '@/environments/environment';
import { I18nDirective, I18nService } from '@/shared/i18n';
import { getErrorMessage, getFormControl } from '@/shared/lib/form.helper';
import { AgridataMultiSelectComponent } from '@/shared/ui/agridata-multi-select';
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

  // Input properties
  readonly form = input<FormGroup>();
  readonly formDisabled = input<boolean>(false);

  // Signals
  protected readonly selectedCategory = signal<string | null>(null);

  // Computed Signals
  protected readonly allSystemsLabel = computed(() =>
    this.i18nService.translate('data-request.form.products.allSystems'),
  );

  protected readonly dataProductsCategories = computed(() => {
    const categories = this.metaDataService.dataProductsCategories();
    const mappedCategories = categories.map((category) => ({
      label: category.label,
      value: category.label,
    }));

    // If only one category, don't show "All" option
    if (categories.length === 1) {
      return mappedCategories;
    }

    return [{ label: this.allSystemsLabel(), value: null }, ...mappedCategories];
  });

  protected readonly productsGrouped = computed(() => {
    const selectedCat = this.selectedCategory();
    const allProducts = this.metaDataService.dataProducts();
    const categories = this.metaDataService.dataProductsCategories();

    if (selectedCat === null) {
      return categories.map((category) => ({
        categoryLabel: category.label,
        options: allProducts
          .filter((product) => product.dataSourceSystemCode === category.label)
          .map((product) => ({
            label: product.name?.[this.i18nService.lang() as keyof typeof product.name] ?? '',
            value: product.id,
          })),
      }));
    }

    const filteredProducts = allProducts
      .filter((product) => product.dataSourceSystemCode === selectedCat)
      .map((product) => ({
        label: product.name?.[this.i18nService.lang() as keyof typeof product.name] ?? '',
        value: product.id,
      }));

    return [
      {
        categoryLabel: selectedCat,
        options: filteredProducts,
      },
    ];
  });

  // Effects
  private readonly categoryChangeEffect = effect(() => {
    const category = this.selectedCategory();
    const productsControl = getFormControl(this.form()!, 'request.products');

    if (!productsControl || category === null) {
      return;
    }

    const currentProducts = (productsControl.value as string[]) ?? [];
    const allProducts = this.metaDataService.dataProducts();

    const validProducts = currentProducts.filter((id) =>
      allProducts.some((p) => p.id === id && p.dataSourceSystemCode === category),
    );

    if (validProducts.length !== currentProducts.length) {
      productsControl.setValue(validProducts);
    }
  });

  private readonly singleCategoryAutoSelectEffect = effect(() => {
    const categories = this.metaDataService.dataProductsCategories();
    if (categories.length === 1 && this.selectedCategory() === null) {
      this.selectedCategory.set(categories[0].label);
    }
  });

  // Protected methods
  protected onCategoryChange(value: string | number | null): void {
    this.selectedCategory.set(value as string | null);
  }

  protected hasProductsError(): boolean {
    const control = getFormControl(this.form()!, 'request.products');
    return (control?.touched && control?.invalid) ?? false;
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
}
