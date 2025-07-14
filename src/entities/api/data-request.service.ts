import { Injectable, inject, resource } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { DataRequestsService } from '@/entities/openapi/api/dataRequests.service';

import { DataProductsService, DataRequestDto, DataRequestUpdateDto } from '../openapi';

@Injectable({
  providedIn: 'root',
})
export class DataRequestService {
  private readonly apiService = inject(DataRequestsService);
  private readonly dataProductService = inject(DataProductsService);

  readonly fetchDataRequests = resource({
    loader: () => firstValueFrom(this.apiService.getDataRequests()),
  });

  readonly fetchDataProducts = resource({
    loader: () => firstValueFrom(this.dataProductService.getDataProducts()),
  });

  async createDataRequest(dataRequest: DataRequestUpdateDto): Promise<DataRequestDto> {
    return firstValueFrom(this.apiService.createDataRequestDraft(dataRequest));
  }

  async updateDataRequestDetails(dataRequestId: string, dataRequest: DataRequestUpdateDto) {
    return firstValueFrom(this.apiService.updateDataRequestDetails(dataRequestId, dataRequest));
  }
}
