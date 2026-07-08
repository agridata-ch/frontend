import { inject, Service } from '@angular/core';
import { firstValueFrom, map } from 'rxjs';

import {
  DataProductDto,
  DataProductsService,
  DataProductUpdateDto,
  ResourceQueryDto,
} from '@/entities/openapi';
import { ActingRole } from '@/shared/constants/constants';
import { arrayToObjectSortParams, asPageResponse, PageResponseDto } from '@/shared/lib/api.helper';

type DataProductActingRoles = 'PROVIDER' | 'ADMIN' | undefined;

/**
 * Service for managing data products.
 *
 * CommentLastReviewed: 2026-06-08
 */
@Service()
export class DataProductService {
  private readonly apiService = inject(DataProductsService);

  createDataProduct = (
    dto: Record<string, unknown>,
    actingRole?: ActingRole,
  ): Promise<DataProductDto> => {
    return firstValueFrom(
      this.apiService.createDataProductDraft(
        dto as unknown as DataProductUpdateDto,
        actingRole as DataProductActingRoles,
      ),
    );
  };

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
          actingRole as DataProductActingRoles,
        )
        .pipe(map((response) => asPageResponse(response))),
    );
  };

  setDataProductStatus = (
    id: string,
    stateCode: string,
    actingRole?: ActingRole,
  ): Promise<DataProductDto> => {
    return firstValueFrom(
      this.apiService.setDataProductStatus(id, stateCode, actingRole as DataProductActingRoles),
    );
  };

  getDataProductById = (id: string, actingRole?: ActingRole): Promise<DataProductDto> => {
    return firstValueFrom(this.apiService.getDataProduct(id, actingRole as DataProductActingRoles));
  };

  updateDataProduct = (
    id: string,
    dto: Record<string, unknown>,
    actingRole?: ActingRole,
  ): Promise<DataProductDto> => {
    return firstValueFrom(
      this.apiService.updateDataProductDraft(
        id,
        dto as unknown as DataProductUpdateDto,
        actingRole as DataProductActingRoles,
      ),
    );
  };
}
