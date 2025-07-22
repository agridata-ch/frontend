import { Component, computed, inject } from '@angular/core';

import { environment } from '@/environments/environment';
import { TestDataApiService } from '@/widgets/footer-widget/api/test-data.service';

import { version } from '../../../../package.json'; // Adjust the path as necessary

@Component({
  selector: 'app-footer-widget',
  imports: [],
  templateUrl: './footer-widget.component.html',
})
export class FooterWidgetComponent {
  private readonly testDataService = inject(TestDataApiService);
  public version;
  readonly isDevMode = computed(() => !environment.production);

  constructor() {
    this.version = version;
  }

  // remove this method for production
  // it is only for testing purposes to reset the test data
  async resetData() {
    await this.testDataService.resetTestData().finally(() => {
      window.location.reload();
    });
  }
}
