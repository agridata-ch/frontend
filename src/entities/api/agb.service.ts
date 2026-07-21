import { inject, Service } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { AgbRevisionService } from '@/entities/openapi';

/**
 * Service for retrieving agb content from the API.
 *
 * CommentLastReviewed: 2026-07-16
 */
@Service()
export class AgbService {
  private readonly agbRevisionService = inject(AgbRevisionService);

  fetchAgbs() {
    return firstValueFrom(this.agbRevisionService.getCurrentAgbRevision());
  }
}
