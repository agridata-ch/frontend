import { computed, effect, inject, Injectable, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { ErrorHandlerService } from '@/app/error/error-handler.service';
import { DataProductDto, DataProviderDto, DataProvidersService } from '@/entities/openapi';
import { AuthService } from '@/shared/lib/auth';

/**
 * Service for retrieving masterdata needed across multiple components, such as data products and data providers.
 * Products are cached per provider and can be retrieved without mutating global state.
 *
 * CommentLastReviewed: 2026-02-09
 */
@Injectable({
  providedIn: 'root',
})
export class MasterDataService {
  // Injects
  private readonly authService = inject(AuthService);
  private readonly dataProviderService = inject(DataProvidersService);
  private readonly errorService = inject(ErrorHandlerService);

  // Signals
  private readonly _dataProviders = signal<DataProviderDto[]>([]);
  private readonly _loadingProviderIds = signal<Set<string>>(new Set());
  private readonly _productsByProvider = signal<Map<string, DataProductDto[]>>(new Map());
  readonly dataProviders = this._dataProviders.asReadonly();

  // Computed Signals
  readonly isLoadingProducts = computed(() => this._loadingProviderIds().size > 0);
  readonly isProvidersLoading = computed(
    () => this._dataProviders().length === 0 && this.authService.isAuthenticated(),
  );

  // Effects
  private readonly dataFetchEffect = effect(() => {
    if (this.authService.isAuthenticated()) {
      this.fetchDataProviders()
        .then((providers) => this._dataProviders.set(providers))
        .catch((error) => this.errorService.handleError(error));
    }
  });

  // Public methods
  /**
   * Returns cached products for a provider, or an empty array if not yet loaded.
   * Use ensureProductsLoaded() to trigger loading.
   *
   * @param providerId - The provider ID to get products for
   * @returns Array of products for the provider
   */
  getProductsForProvider(providerId: string | undefined): DataProductDto[] {
    if (!providerId) {
      return [];
    }
    return this._productsByProvider().get(providerId) ?? [];
  }

  /**
   * Checks if products are currently being loaded for a specific provider.
   *
   * @param providerId - The provider ID to check
   * @returns true if loading, false otherwise
   */
  isLoadingProductsByProvider(providerId: string | undefined): boolean {
    if (!providerId) {
      return false;
    }
    return this._loadingProviderIds().has(providerId);
  }

  /**
   * Fetches products for a provider. If already cached, returns immediately.
   * Safe to call multiple times - will not refetch if already loaded or loading.
   * Errors are handled internally via errorService.
   *
   * @param providerId - The provider ID to fetch products for
   */
  fetchProductsByProvider(providerId: string | undefined): void {
    if (!providerId) {
      return;
    }

    // Already cached
    if (this._productsByProvider().has(providerId)) {
      return;
    }

    // Already loading
    if (this._loadingProviderIds().has(providerId)) {
      return;
    }

    this._loadingProviderIds.update((set) => {
      const newSet = new Set(set);
      newSet.add(providerId);
      return newSet;
    });

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
      })
      .finally(() => {
        this._loadingProviderIds.update((set) => {
          const newSet = new Set(set);
          newSet.delete(providerId);
          return newSet;
        });
      });
  }

  // Private methods
  private fetchDataProductsByProviderId(providerId: string): Promise<DataProductDto[]> {
    return firstValueFrom(this.dataProviderService.getDataProductsByProviderId(providerId));
  }

  private fetchDataProviders(): Promise<DataProviderDto[]> {
    return firstValueFrom(this.dataProviderService.getDataProviders());
  }
}
