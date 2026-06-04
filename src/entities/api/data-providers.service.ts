import { inject, Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import {
  DataProviderDto,
  DataProvidersService as DataProvidersApiService,
  DataSourceSystemDto,
  RestClientDto,
} from '@/entities/openapi';

/**
 * Entity-level wrapper for data provider API calls.
 *
 * CommentLastReviewed: 2026-06-04
 */
@Injectable({
  providedIn: 'root',
})
export class DataProvidersService {
  private readonly apiService = inject(DataProvidersApiService);

  getDataProviders(): Promise<DataProviderDto[]> {
    return firstValueFrom(this.apiService.getDataProviders());
  }

  getDataSourceSystems(providerId: string): Promise<DataSourceSystemDto[]> {
    return firstValueFrom(this.apiService.getDataSourceSystemsByProviderId(providerId));
  }

  getRestClients(providerId: string): Promise<RestClientDto[]> {
    return firstValueFrom(this.apiService.getRestClientsByProviderId(providerId));
  }
}
