import { Component, effect, inject, resource } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { faFileCheck } from '@awesome.me/kit-0b6d1ed528/icons/classic/regular';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

import { ErrorHandlerService } from '@/app/error/error-handler.service';
import { DataRequestService } from '@/entities/api';
import { DataRequestDto } from '@/entities/openapi';
import { ROUTE_PATHS } from '@/shared/constants/constants';
import { ErrorOutletComponent } from '@/shared/error-alert-outlet/error-outlet.component';
import { I18nDirective } from '@/shared/i18n';
import {
  createResourceErrorHandlerEffect,
  createResourceValueComputed,
} from '@/shared/lib/api.helper';
import { AdminDataRequestTableComponent } from '@/widgets/admin-data-request-table';

export const FORCE_RELOAD_DATA_REQUESTS_STATE_PARAM = 'refresh';

/**
 * Admin page for managing data requests and administrative tasks
 *
 * CommentLastReviewed: 2026-01-06
 */
@Component({
  selector: 'app-admin-page',
  imports: [
    FontAwesomeModule,
    I18nDirective,
    AdminDataRequestTableComponent,
    ErrorOutletComponent,
    RouterOutlet,
  ],
  templateUrl: './admin.page.html',
})
export class AdminPage {
  private readonly dataRequestService = inject(DataRequestService);
  private readonly errorService = inject(ErrorHandlerService);
  private readonly router = inject(Router);

  protected readonly icon = faFileCheck;
  protected readonly dataRequestsResource = resource({
    loader: () => this.dataRequestService.fetchDataRequests(),
    defaultValue: [],
  });
  protected readonly dataRequests = createResourceValueComputed(this.dataRequestsResource, []);
  private readonly errorHandlerEffect = createResourceErrorHandlerEffect(
    this.dataRequestsResource,
    this.errorService,
  );

  private readonly reloadDataRequestsEffect = effect(() => {
    const nav = this.router.currentNavigation();
    if (nav?.extras?.state?.[FORCE_RELOAD_DATA_REQUESTS_STATE_PARAM]) {
      this.dataRequestsResource.reload();
    }
  });

  protected navigateToRequest = (request?: DataRequestDto | null) => {
    if (request?.id) {
      this.router.navigate([ROUTE_PATHS.ADMIN_PATH, request.id]).then();
    }
  };
}
