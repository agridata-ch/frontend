import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { TestDataService } from '@/entities/openapi/api/testData.service';

@Injectable({
  providedIn: 'root',
})
export class TestDataApiService {
  private readonly apiService = inject(TestDataService);

  resetTestData() {
    return firstValueFrom(this.apiService.resetTestData());
  }
}
