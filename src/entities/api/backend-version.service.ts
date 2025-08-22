import { Injectable, inject, resource } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { InfoResourceService } from '@/entities/openapi/api/infoResource.service';

@Injectable({ providedIn: 'root' })
export class BackendVersionService {
  private readonly infoResourceService = inject(InfoResourceService);

  readonly fetchBackendVersion = resource({
    loader: () => {
      return firstValueFrom(this.infoResourceService.qInfoGet());
    },
  });
}
