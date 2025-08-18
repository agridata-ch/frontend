import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { ParticipantsService } from '@/entities/openapi';

@Injectable({
  providedIn: 'root',
})
export class ParticipantService {
  private readonly apiService = inject(ParticipantsService);

  async getAuthorizedUids() {
    return firstValueFrom(this.apiService.getAuthorizedUids());
  }
}
