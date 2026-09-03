import { inject, Service } from '@angular/core';
import { firstValueFrom, map } from 'rxjs';

import {
  DataProductDto,
  DataProductsService,
  DataProductUpdateDto,
  PageResponseDtoPublicDataProductDto,
  PublicDataProductDto,
  PublicDataProductsService,
  ResourceQueryDto,
} from '@/entities/openapi';
import { ActingRole } from '@/shared/constants/constants';
import { arrayToObjectSortParams, asPageResponse, PageResponseDto } from '@/shared/lib/api.helper';

type DataProductActingRoles = 'PROVIDER' | 'ADMIN' | undefined;

/**
 * Service for managing data products.
 *
 * CommentLastReviewed: 2026-07-30
 */
@Service()
export class DataProductService {
  private readonly apiService = inject(DataProductsService);
  private readonly publicApiService = inject(PublicDataProductsService);

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

  deleteDataProduct = (id: string, actingRole?: ActingRole): Promise<void> => {
    return firstValueFrom(
      this.apiService.deleteDataProductDraft(id, actingRole as DataProductActingRoles),
    );
  };

  getAllDataProducts = (
    queryDto: ResourceQueryDto,
    actingRole?: ActingRole,
  ): Promise<PageResponseDto<DataProductDto>> => {
    return firstValueFrom(
      this.apiService
        .getDataProductsPaginated(
          queryDto.language,
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

  patchDataProduct = (
    id: string,
    dto: Record<string, unknown>,
    actingRole?: ActingRole,
  ): Promise<DataProductDto> => {
    return firstValueFrom(
      this.apiService.patchDataProduct(
        id,
        dto as unknown as DataProductUpdateDto,
        actingRole as DataProductActingRoles,
      ),
    );
  };

  getPublicProducts = (
    queryDto: ResourceQueryDto,
  ): Promise<PageResponseDtoPublicDataProductDto> => {
    return firstValueFrom(
      this.publicApiService
        .getPublicDataProductsPaginated(
          queryDto.language,
          queryDto.page,
          queryDto.searchTerm,
          queryDto.size,
          arrayToObjectSortParams(queryDto.sortParams, 'sortBy'),
        )
        .pipe(map((response) => asPageResponse(response))),
    );
  };

  getPublicProductById = (id: string): Promise<PublicDataProductDto> =>
    firstValueFrom(this.publicApiService.getPublicDataProduct(id));
}
