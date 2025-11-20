import { effect, inject, Injectable, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { DataProductDto, DataProductsService } from '@/entities/openapi';
import { AuthService } from '@/shared/lib/auth';

/**
 * Service for retrieving mastardata needed across multiple components, such as data products and user preferences.
 *
 * CommentLastReviewed: 2025-11-20
 */
@Injectable({
  providedIn: 'root',
})
export class MasterDataService {
  private readonly authService = inject(AuthService);
  private readonly dataProductService = inject(DataProductsService);

  private readonly _dataProducts = signal<Array<DataProductDto>>([]);

  readonly dataProducts = this._dataProducts.asReadonly();

  private readonly dataProductFetchEffect = effect(() => {
    if (this.authService.isAuthenticated()) {
      this.fetchDataProducts().then((products) => {
        this._dataProducts.set(products);
      });
    }
  });

  private fetchDataProducts() {
    return firstValueFrom(this.dataProductService.getDataProducts());
  }
}
