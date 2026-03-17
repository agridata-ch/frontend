import { inject, Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { ContractRevisionsService } from '@/entities/openapi';

/**
 * Service for managing contract revisions through the API. Provides methods to fetch contract
 *
 * CommentLastReviewed: 2026-03-17
 */
@Injectable({
  providedIn: 'root',
})
export class ContractRevisionService {
  private readonly apiService = inject(ContractRevisionsService);

  fetchContract(id: string) {
    return firstValueFrom(this.apiService.getContractRevision(id));
  }
}
