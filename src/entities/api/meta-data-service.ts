import { Injectable, inject, resource } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { DataProductsService } from '@/entities/openapi';

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

  readonly fetchDataProducts = resource({
    loader: () => firstValueFrom(this.dataProductService.getDataProducts()),
  });
}
