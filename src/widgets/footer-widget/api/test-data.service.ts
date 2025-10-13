import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { TestDataService } from '@/entities/openapi/api/testData.service';

/**
 * Provides an API service for resetting test data. It integrates with the OpenAPI-based
 * TestDataService and exposes a method to trigger reset operations, used exclusively in
 * development contexts.
 *
 * CommentLastReviewed: 2025-08-25
 */
@Injectable({
  providedIn: 'root',
})
export class TestDataApiService {
  private readonly apiService = inject(TestDataService);

  resetTestData() {
    return firstValueFrom(this.apiService.resetTestData());
  }
}
