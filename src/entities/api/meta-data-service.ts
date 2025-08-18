import { Injectable, inject, resource } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { DataProductsService } from '@/entities/openapi';

@Injectable({
  providedIn: 'root',
})
export class MetaDataService {
  private readonly dataProductService = inject(DataProductsService);

  readonly fetchDataProducts = resource({
    loader: () => firstValueFrom(this.dataProductService.getDataProducts()),
  });
}
