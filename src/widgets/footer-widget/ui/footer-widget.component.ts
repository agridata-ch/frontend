import { Component, computed, inject, signal } from '@angular/core';

import { BackendVersionService } from '@/entities/api';
import { environment } from '@/environments/environment';
import { TestDataApiService } from '@/widgets/footer-widget/api/test-data.service';

import { version as frontendVersion } from '../../../../package.json';

@Component({
  selector: 'app-footer-widget',
  imports: [],
  templateUrl: './footer-widget.component.html',
})
export class FooterWidgetComponent {
  private readonly testDataService = inject(TestDataApiService);
  private readonly backendVersionService = inject(BackendVersionService);

  protected readonly frontendVersion = signal(frontendVersion);
  protected readonly backendVersion = this.backendVersionService.fetchBackendVersion;

  readonly isDevMode = computed(() => !environment.production);

  // remove this method for production
  // it is only for testing purposes to reset the test data
  async resetData() {
    await this.testDataService.resetTestData().finally(() => {
      window.location.reload();
    });
  }
}
