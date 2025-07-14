import { Injectable, inject, resource } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { UidRegisterSearchService } from '../openapi';

@Injectable({
  providedIn: 'root',
})
export class UidRegisterService {
  private readonly apiService = inject(UidRegisterSearchService);

  readonly uidInfosOfCurrentUser = resource({
    loader: () => firstValueFrom(this.apiService.getByUidOfCurrentUser()),
  });

  searchByUidResource(uid: number) {
    return resource({
      loader: () => firstValueFrom(this.apiService.getByUid(uid)),
    });
  }
}
