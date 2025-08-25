import { Injectable, inject, resource } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { UIDRegisterSearchService } from '@/entities/openapi';

/**
 * Service for interacting with the UID Register API.
 * Provides methods to retrieve UID information for the current user
 * or by a specific UID, exposing results as Angular resources for reactive usage.
 *
 * CommentLastReviewed: 2025-08-25
 */
@Injectable({
  providedIn: 'root',
})
export class UidRegisterService {
  private readonly apiService = inject(UIDRegisterSearchService);

  readonly fetchUidInfosOfCurrentUser = resource({
    loader: () => firstValueFrom(this.apiService.getByUidOfCurrentUser()),
  });

  searchByUidResource(uid: number) {
    return resource({
      loader: () => firstValueFrom(this.apiService.getByUid(uid)),
    });
  }
}
