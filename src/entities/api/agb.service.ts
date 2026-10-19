import { inject, Service } from '@angular/core';
import { firstValueFrom, map } from 'rxjs';

import {
  AgbRevisionAdminService,
  AgbRevisionDto,
  AgbRevisionOverviewDto,
  AgbRevisionService,
  ResourceQueryDto,
  UsersService,
} from '@/entities/openapi';
import {
  arrayToObjectSortParams,
  asPageResponse,
  columnFiltersToObject,
  PageResponseDto,
} from '@/shared/lib/api.helper';

/**
 * Service for retrieving AGB revisions and recording their acceptance.
 *
 * CommentLastReviewed: 2026-10-01
 */
@Service()
export class AgbService {
  // Injects
  private readonly agbRevisionAdminService = inject(AgbRevisionAdminService);
  private readonly agbRevisionService = inject(AgbRevisionService);
  private readonly usersService = inject(UsersService);

  async acceptAgbs(agbRevisionId: string): Promise<void> {
    await firstValueFrom(this.usersService.acceptAgb(agbRevisionId));
  }

  fetchAgbs(): Promise<AgbRevisionDto> {
    return firstValueFrom(this.agbRevisionService.getCurrentAgbRevision());
  }

  fetchAllAgbRevisions(
    queryDto: ResourceQueryDto,
  ): Promise<PageResponseDto<AgbRevisionOverviewDto>> {
    return firstValueFrom(
      this.agbRevisionAdminService
        .getAllAgbRevisions(
          columnFiltersToObject(queryDto.columnFilters),
          queryDto.language,
          queryDto.page,
          queryDto.searchTerm,
          queryDto.size,
          arrayToObjectSortParams(queryDto.sortParams, 'sortBy'),
        )
        .pipe(map((response) => asPageResponse(response))),
    );
  }
}
