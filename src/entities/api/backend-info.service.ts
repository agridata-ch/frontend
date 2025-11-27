import { inject, Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { InfoResourceService } from '@/entities/openapi/api/infoResource.service';

/**
 * Service for retrieving backend version information from the API. Provides a reactive resource
 * that fetches version metadata to ensure compatibility and display environment details in the UI.
 *
 * CommentLastReviewed: 2025-08-25
 */
@Injectable({ providedIn: 'root' })
export class BackendInfoService {
  private readonly infoResourceService = inject(InfoResourceService);

  fetchBackendInfo() {
    return firstValueFrom(this.infoResourceService.qInfoGet());
  }
}
