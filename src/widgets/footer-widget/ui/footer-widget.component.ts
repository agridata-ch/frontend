import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { AgridataStateService } from '@/entities/api/agridata-state.service';
import { environment } from '@/environments/environment';
import { ROUTE_PATHS } from '@/shared/constants/constants';
import { I18nPipe } from '@/shared/i18n/i18n.pipe';
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
  imports: [I18nPipe, RouterLink],
  templateUrl: './footer-widget.component.html',
})
export class FooterWidgetComponent {
  private readonly testDataService = inject(TestDataApiService);
  private readonly stateService = inject(AgridataStateService);

  protected readonly ROUTE_PATHS = ROUTE_PATHS;
  private clickTimeout?: ReturnType<typeof setTimeout>;
  readonly appBaseUrl = environment.appBaseUrl;

  protected readonly frontendVersion = signal(frontendVersion);
  protected readonly backendVersion = this.stateService.backendInfo;
  protected readonly hideCopyright = signal(false);
  private readonly clickCount = signal(0);

  protected readonly canResetData = computed(() => environment.canResetTestData);
  protected readonly isCmsPage = computed(() => {
    const route = this.stateService.currentRouteWithoutQueryParams();
    return route?.startsWith(`/cms`) || route === '/';
  });
  protected readonly currentYear = computed(() => new Date().getFullYear());

  protected handleClickCopyright() {
    if (this.clickTimeout) {
      globalThis.clearTimeout(this.clickTimeout);
    }

    const newCount = this.clickCount() + 1;
    this.clickCount.set(newCount);

    this.clickTimeout = globalThis.setTimeout(() => {
      if (newCount === 7) {
        this.hideCopyright.set(true);
      } else {
        this.hideCopyright.set(false);
      }
      this.clickCount.set(0);
    }, 500);
  }

  // remove this method for production
  // it is only for testing purposes to reset the test data
  async resetData() {
    if (environment.canResetTestData)
      await this.testDataService.resetTestData().finally(() => {
        globalThis.location.reload();
      });
  }
}
