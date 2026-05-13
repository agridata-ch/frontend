import { inject, Injectable } from '@angular/core';
import { firstValueFrom, map } from 'rxjs';

import { DataProductDto, DataProductsService, ResourceQueryDto } from '@/entities/openapi';
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

  getAllDataProducts = (queryDto: ResourceQueryDto): Promise<PageResponseDto<DataProductDto>> => {
    return firstValueFrom(
      this.apiService
        .getDataProductsPaginated(
          queryDto.page,
          '',
          queryDto.size,
          arrayToObjectSortParams(queryDto.sortParams, 'sortyBy'),
        )
        .pipe(map((response) => asPageResponse(response))),
    );
  };
}
