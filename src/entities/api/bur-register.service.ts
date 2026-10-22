import { inject, Service } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { BURRegisterSearchService } from '@/entities/openapi';

/**
 * Service for interacting with the BUR Register API.
 * Retrieves the organisation information (name, legal name, UID, address) of the current user.
 *
 * CommentLastReviewed: 2026-10-22
 */
@Service()
export class BurRegisterService {
  private readonly burRegisterSearchService = inject(BURRegisterSearchService);

  fetchBurInfosOfCurrentUser() {
    return firstValueFrom(this.burRegisterSearchService.getBurRegisterByUidOfCurrentUser());
  }
}
