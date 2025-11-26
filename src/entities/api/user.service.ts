import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { map } from 'rxjs/operators';

import {
  ResourceQueryDto,
  UserInfoDto,
  UserPreferencesDto,
  UsersService,
} from '@/entities/openapi';
import { PageResponseDto, arrayToObjectSortParams, asPageResponse } from '@/shared/lib/api.helper';

/**
 * Service for interacting with participant-related API endpoints. Provides methods to retrieve UIDs
 * that the current user is authorized to access, ensuring proper scoping of data operations.
 *
 * CommentLastReviewed: 2025-08-25
 */
@Injectable({
  providedIn: 'root',
})
export class UserService {
  private readonly apiService = inject(UsersService);

  getAuthorizedUids() {
    return this.apiService.getAuthorizedUids();
  }

  getProducers = (queryDto: ResourceQueryDto): Promise<PageResponseDto<UserInfoDto>> => {
    return firstValueFrom(
      this.apiService
        .getProducers(
          queryDto.page,
          queryDto.searchTerm,
          queryDto.size,
          arrayToObjectSortParams(queryDto.sortParams, 'sortBy'),
        )
        .pipe(map((response) => asPageResponse(response))),
    );
  };

  getUserInfo() {
    return this.apiService.getUserInfo();
  }

  updateUserPreferences(preferences: UserPreferencesDto) {
    return firstValueFrom(this.apiService.updateUserPreferences(preferences));
  }
}
