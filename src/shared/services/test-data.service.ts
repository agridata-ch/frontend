import { inject, Injectable } from '@angular/core';
import { TestDataService } from '@shared/api/openapi/api/testData.service';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class TestDataApiService {
  private readonly apiService = inject(TestDataService);

  resetTestData(): Promise<void> {
    return firstValueFrom(this.apiService.resetTestData());
  }
}
