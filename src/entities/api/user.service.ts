import { HttpContext } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { map } from 'rxjs/operators';

import {
  AgbAcceptanceOverviewDto,
  BurDto,
  FarmOverviewDto,
  ResourceQueryDto,
  UidDto,
  UserInfoDto,
  UserPreferencesDto,
  UsersService,
} from '@/entities/openapi';
import { ActingRole } from '@/shared/constants/constants';
import { AUTHORIZED_UIDS_ERROR_HANDLING } from '@/shared/error/http-error-method';
import {
  PageResponseDto,
  arrayToObjectSortParams,
  asPageResponse,
  columnFiltersToObject,
} from '@/shared/lib/api.helper';

const UID_ACTING_ROLES = ['PRODUCER', 'ADMIN', 'SUPPORT'] as const;

function isUidActingRole(role: ActingRole | undefined): role is (typeof UID_ACTING_ROLES)[number] {
  return UID_ACTING_ROLES.some((allowed) => allowed === role);
}

/**
 * Service for interacting with participant-related API endpoints. Provides methods to retrieve UIDs
 * that the current user is authorized to access, ensuring proper scoping of data operations.
 *
 * CommentLastReviewed: 2025-08-25
 */
@Service()
export class UserService {
  private readonly apiService = inject(UsersService);

  getAgbAcceptances = (
    queryDto: ResourceQueryDto,
  ): Promise<PageResponseDto<AgbAcceptanceOverviewDto>> => {
    return firstValueFrom(
      this.apiService
        .getAgbAcceptances(
          columnFiltersToObject(queryDto.columnFilters),
          queryDto.language,
          queryDto.page,
          queryDto.searchTerm,
          queryDto.size,
          arrayToObjectSortParams(queryDto.sortParams, 'sortBy'),
        )
        .pipe(map((response) => asPageResponse(response))),
    );
  };

  getAuthorizedBursByUid(uid: string): Promise<BurDto[]> {
    return firstValueFrom(this.apiService.getAuthorizedBursByUid(uid));
  }

  getAuthorizedUids(actingRole?: ActingRole) {
    return this.apiService.getAuthorizedUids(
      undefined,
      undefined,
      isUidActingRole(actingRole) ? actingRole : undefined,
      undefined,
      undefined,
      {
        context: new HttpContext().set(AUTHORIZED_UIDS_ERROR_HANDLING, true),
      },
    );
  }

  getFarmOverview(uid: string, actingRole?: ActingRole): Promise<FarmOverviewDto> {
    return firstValueFrom(
      this.apiService.getFarmOverview(uid, isUidActingRole(actingRole) ? actingRole : undefined),
    );
  }

  getProducers = (queryDto: ResourceQueryDto): Promise<PageResponseDto<UserInfoDto>> => {
    return firstValueFrom(
      this.apiService
        .getProducers(
          columnFiltersToObject(queryDto.columnFilters),
          queryDto.language,
          queryDto.page,
          queryDto.searchTerm,
          queryDto.size,
          arrayToObjectSortParams(queryDto.sortParams, 'sortBy'),
        )
        .pipe(map((response) => asPageResponse(response))),
    );
  };

  getUidByBur(bur: string): Promise<UidDto> {
    return firstValueFrom(this.apiService.getUidByBur(bur));
  }

  getUserInfo() {
    return this.apiService.getUserInfo();
  }

  updateUserPreferences(preferences: UserPreferencesDto) {
    return firstValueFrom(this.apiService.updateUserPreferences(preferences));
  }
}
