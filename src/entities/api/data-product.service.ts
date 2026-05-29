import { inject, Injectable } from '@angular/core';
import { firstValueFrom, map } from 'rxjs';

import { DataProductDto, DataProductsService, ResourceQueryDto } from '@/entities/openapi';
import { ActingRole } from '@/shared/constants/constants';
import { arrayToObjectSortParams, asPageResponse, PageResponseDto } from '@/shared/lib/api.helper';

/**
 * Service for retrieving data products. Currently mocks paginated data; integrates with v2 BE when ready.
 *
 * CommentLastReviewed: 2026-05-13
 */
@Injectable({
  providedIn: 'root',
})
export class DataProductService {
  private readonly apiService = inject(DataProductsService);

  getAllDataProducts = (
    queryDto: ResourceQueryDto,
    locale: string,
    actingRole?: ActingRole,
  ): Promise<PageResponseDto<DataProductDto>> => {
    this.apiService.defaultHeaders = this.apiService.defaultHeaders.set('Accept-Language', locale);
    return firstValueFrom(
      this.apiService
        .getDataProductsPaginated(
          queryDto.page,
          queryDto.searchTerm,
          queryDto.size,
          arrayToObjectSortParams(queryDto.sortParams, 'sortBy'),
          actingRole as 'PROVIDER' | 'ADMIN' | undefined,
        )
        .pipe(map((response) => asPageResponse(response))),
    );
  };
}
