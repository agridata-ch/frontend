import { effect, inject, Injectable, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { DataProductDto, DataProductsService } from '@/entities/openapi';

/**
 * Service for retrieving metadata about available data products.
 *
 * CommentLastReviewed: 2025-08-25
 */
@Injectable({
  providedIn: 'root',
})
export class MetaDataService {
  private readonly dataProductService = inject(DataProductsService);

  private readonly dataProducts = signal<Array<DataProductDto>>([]);

  dataProductFetchEffect = effect(() => {
    this.fetchDataProducts().then((products) => {
      this.dataProducts.set(products);
    });
  });

  getDataProducts() {
    return this.dataProducts.asReadonly();
  }

  private fetchDataProducts() {
    return firstValueFrom(this.dataProductService.getDataProducts());
  }
}
