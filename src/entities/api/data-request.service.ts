import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { DataRequestsService } from '@/entities/openapi/api/dataRequests.service';

import { DataProductsService, DataRequestDto, DataRequestUpdateDto } from '../openapi';

@Injectable({
  providedIn: 'root',
})
export class DataRequestService {
  private readonly apiService = inject(DataRequestsService);
  private readonly dataProductService = inject(DataProductsService);

  async fetchDataRequests() {
    return (await firstValueFrom(this.apiService.getDataRequests())).slice();
  }

  async fetchDataProducts() {
    return firstValueFrom(this.dataProductService.getDataProducts());
  }

  createDataRequest(dataRequest: DataRequestUpdateDto): Promise<DataRequestDto> {
    return firstValueFrom(this.apiService.createDataRequestDraft(dataRequest));
  }

  updateDataRequestDraft(dataRequestId: string, dataRequest: DataRequestUpdateDto) {
    return firstValueFrom(this.apiService.updateDataRequestDraft(dataRequestId, dataRequest));
  }
}
