import { Injectable, inject, resource } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { UIDRegisterSearchService } from '@/entities/openapi';

@Injectable({
  providedIn: 'root',
})
export class UidRegisterService {
  private readonly apiService = inject(UIDRegisterSearchService);

  readonly uidInfosOfCurrentUser = resource({
    loader: () => firstValueFrom(this.apiService.getByUidOfCurrentUser()),
  });

  searchByUidResource(uid: number) {
    return resource({
      loader: () => firstValueFrom(this.apiService.getByUid(uid)),
    });
  }
}
