import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { ParticipantsService } from '@/entities/openapi';

/**
 * Service for interacting with participant-related API endpoints. Provides methods to retrieve UIDs
 * that the current user is authorized to access, ensuring proper scoping of data operations.
 *
 * CommentLastReviewed: 2025-08-25
 */
@Injectable({
  providedIn: 'root',
})
export class ParticipantService {
  private readonly apiService = inject(ParticipantsService);

  async getAuthorizedUids() {
    return firstValueFrom(this.apiService.getAuthorizedUids());
  }
}
