import { computed, effect, inject, Injectable, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { DataProductDto, DataProductsService } from '@/entities/openapi';
import { I18nService } from '@/shared/i18n';
import { AuthService } from '@/shared/lib/auth';
import { MultiSelectCategory, MultiSelectOption } from '@/shared/ui/agridata-multi-select';

/**
 * Service for retrieving masterdata needed across multiple components, such as data products and user preferences.
 *
 * CommentLastReviewed: 2026-02-03
 */
@Injectable({
  providedIn: 'root',
})
export class MasterDataService {
  // Injects
  private readonly authService = inject(AuthService);
  private readonly dataProductService = inject(DataProductsService);
  private readonly i18nService = inject(I18nService);

  // Signals
  private readonly _dataProducts = signal<DataProductDto[]>([]);
  readonly dataProducts = this._dataProducts.asReadonly();
  protected readonly allSystems = this.i18nService.translateSignal(
    'master-data.products.allSystems',
  );

  // Computed Signals
  readonly dataProductsCategories = computed(() => {
    const grouped = this.dataProductsGrouped();
    return [
      ...grouped.map((category) => ({
        label: category.categoryLabel,
        value: category.categoryLabel,
      })),
    ];
  });

  readonly dataProductsGrouped = computed(() =>
    this.groupDataProductsByCategory(this._dataProducts()),
  );

  // Effects
  private readonly dataProductFetchEffect = effect(() => {
    if (this.authService.isAuthenticated()) {
      this.fetchDataProducts().then((products) => {
        this._dataProducts.set(products);
      });
    }
  });

  getDataProductsByCategory(category?: string): MultiSelectOption[] {
    const products = this._dataProducts();
    const filtered = category
      ? products.filter((p) => p.dataSourceSystemCode === category)
      : products;

    return filtered.map((item) => ({
      label: item.name?.[this.i18nService.lang() as keyof typeof item.name] ?? '',
      value: item.id,
    }));
  }

  getDataProductsGroupedByCategory(category?: string | null): MultiSelectCategory[] {
    const products = this._dataProducts();
    const filtered = category
      ? products.filter((p) => p.dataSourceSystemCode === category)
      : products;

    return this.groupDataProductsByCategory(filtered);
  }

  private fetchDataProducts(): Promise<DataProductDto[]> {
    return firstValueFrom(this.dataProductService.getDataProducts());
  }

  private groupDataProductsByCategory(products: DataProductDto[]): MultiSelectCategory[] {
    const grouped = new Map<string, DataProductDto[]>();

    for (const product of products) {
      const category = product.dataSourceSystemCode ?? 'undefined';
      if (!grouped.has(category)) {
        grouped.set(category, []);
      }
      grouped.get(category)!.push(product);
    }

    return [...grouped.entries()].map(([categoryLabel, items]) => ({
      categoryLabel,
      options: items.map((item) => ({
        label: item.name?.[this.i18nService.lang() as keyof typeof item.name] ?? '',
        value: item.id,
      })),
    }));
  }
}
