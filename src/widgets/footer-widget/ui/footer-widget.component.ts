import { Component, computed, inject, signal } from '@angular/core';

import { BackendVersionService } from '@/entities/api';
import { environment } from '@/environments/environment';
import { ROUTE_PATHS } from '@/shared/constants/constants';
import { I18nPipe } from '@/shared/i18n/i18n.pipe';
import { createResourceValueComputed } from '@/shared/lib/api.helper';
import { TestDataApiService } from '@/widgets/footer-widget/api/test-data.service';

import { version as frontendVersion } from '../../../../package.json';

/**
 * Implements the footer’s logic and layout. It displays the current frontend and backend versions,
 * conditionally shows a test data reset button in development mode, and refreshes the application
 * after data resets. It integrates environment configuration and version services.
 *
 * CommentLastReviewed: 2025-08-25
 */
@Component({
  selector: 'app-footer-widget',
  imports: [I18nPipe],
  templateUrl: './footer-widget.component.html',
})
export class FooterWidgetComponent {
  private readonly testDataService = inject(TestDataApiService);
  private readonly backendVersionService = inject(BackendVersionService);

  protected readonly ROUTE_PATHS = ROUTE_PATHS;

  protected readonly frontendVersion = signal(frontendVersion);
  protected readonly backendVersionResource = this.backendVersionService.fetchBackendVersion;
  protected readonly backendVersion = createResourceValueComputed(this.backendVersionResource, {});

  readonly isDevMode = computed(() => !environment.production);

  // remove this method for production
  // it is only for testing purposes to reset the test data
  async resetData() {
    await this.testDataService.resetTestData().finally(() => {
      window.location.reload();
    });
  }
}
