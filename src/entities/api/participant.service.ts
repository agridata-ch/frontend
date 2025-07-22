import { Injectable, inject, resource } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { ParticipantsService } from '@/entities/openapi';
import { AuthService } from '@/shared/lib/auth';

@Injectable({
  providedIn: 'root',
})
export class ParticipantService {
  private readonly apiService = inject(ParticipantsService);

  private readonly authService = inject(AuthService);

  readonly getAuthorizedUids = resource({
    loader: () => {
      if (!this.authService.isProducer()) {
        return Promise.resolve([]);
      }
      return firstValueFrom(this.apiService.getAuthorizedUids());
    },
    defaultValue: [],
  });
}
