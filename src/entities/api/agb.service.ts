import { inject, Service } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { AgbRevisionDto, AgbRevisionService, UsersService } from '@/entities/openapi';

/**
 * Service for retrieving the current AGB revision and recording its acceptance.
 *
 * CommentLastReviewed: 2026-07-20
 */
@Service()
export class AgbService {
  // Injects
  private readonly agbRevisionService = inject(AgbRevisionService);
  private readonly usersService = inject(UsersService);

  async acceptAgbs(agbRevisionId: string): Promise<void> {
    await firstValueFrom(this.usersService.acceptAgb(agbRevisionId));
  }

  fetchAgbs(): Promise<AgbRevisionDto> {
    return firstValueFrom(this.agbRevisionService.getCurrentAgbRevision());
  }
}
