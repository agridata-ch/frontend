import { effect, inject, Injectable, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { ErrorHandlerService } from '@/app/error/error-handler.service';
import { DataProductDto, DataProvidersService, DataProviderDto } from '@/entities/openapi';
import { I18nService } from '@/shared/i18n';
import { AuthService } from '@/shared/lib/auth';

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
  private readonly dataProvidersService = inject(DataProvidersService);
  private readonly errorService = inject(ErrorHandlerService);
  private readonly i18nService = inject(I18nService);

  // Signals
  private readonly _dataProviders = signal<DataProviderDto[]>([]);
  readonly dataProviders = this._dataProviders.asReadonly();
  private readonly _productsByProvider = signal<Map<string, DataProductDto[]>>(new Map());

  // Effects
  private readonly dataFetchEffect = effect(() => {
    if (this.authService.isAuthenticated()) {
      this.fetchDataProviders()
        .then((providers) => this._dataProviders.set(providers))
        .catch((error) => this.errorService.handleError(error));
    }
  });

  /**
   * Fetches products for a provider. If already cached, returns immediately.
   * Safe to call multiple times - will not refetch if already loaded or loading.
   * Errors are handled internally via errorService.
   *
   * @param providerId - The provider ID to fetch products for
   */
  fetchProductsByProvider(providerId: string): void {
    // Already cached
    if (this._productsByProvider().has(providerId)) {
      return;
    }

    this.fetchDataProductsByProviderId(providerId)
      .then((products) => {
        this._productsByProvider.update((map) => {
          const newMap = new Map(map);
          newMap.set(providerId, products);
          return newMap;
        });
      })
      .catch((error) => {
        this.errorService.handleError(error);
      });
  }

  /**
   * Gets products for a provider. If not already cached, triggers fetch and returns empty array.
   *
   * @param providerId - The provider ID to get products for
   * @returns Array of products for the provider
   */
  getProductsForProvider(providerId: string): DataProductDto[] {
    const products = this._productsByProvider().get(providerId);
    if (!products) {
      this.fetchProductsByProvider(providerId);
    }
    return (
      products?.sort((a, b) => {
        const nameA = a.name?.[this.i18nService.lang() as keyof typeof a.name] ?? '';
        const nameB = b.name?.[this.i18nService.lang() as keyof typeof b.name] ?? '';
        return nameA.localeCompare(nameB);
      }) ?? []
    );
  }

  private fetchDataProductsByProviderId(providerId: string): Promise<DataProductDto[]> {
    if (!providerId) {
      return Promise.resolve([]);
    }
    return firstValueFrom(this.dataProvidersService.getDataProductsByProviderId(providerId));
  }

  private fetchDataProviders(): Promise<DataProviderDto[]> {
    return firstValueFrom(this.dataProvidersService.getDataProviders());
  }
}
