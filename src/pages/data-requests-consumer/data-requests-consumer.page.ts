import { Component, effect, inject, resource } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { faDatabase, faPlus } from '@awesome.me/kit-0b6d1ed528/icons/classic/regular';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

import { ErrorHandlerService } from '@/app/error/error-handler.service';
import { DataRequestService } from '@/entities/api';
import { AgridataStateService } from '@/entities/api/agridata-state.service';
import { DataRequestDto } from '@/entities/openapi';
import { ROUTE_PATHS } from '@/shared/constants/constants';
import { I18nDirective } from '@/shared/i18n';
import {
  createResourceErrorHandlerEffect,
  createResourceValueComputed,
} from '@/shared/lib/api.helper';
import { ButtonComponent, ButtonVariants } from '@/shared/ui/button';
import { ErrorOutletComponent } from '@/styles/error-alert-outlet/error-outlet.component';
import { DATA_REQUEST_NEW_ID } from '@/widgets/data-request-new';
import { DataRequestTableComponent } from '@/widgets/data-request-table';

export const FORCE_RELOAD_DATA_REQUESTS_STATE_PARAM = 'refresh';

/**
 * Displays a table of existing data requests and integrates a side panel for creating or editing
 * requests. It synchronizes the selected request with the URL, automatically opens details for
 * linked requests, and reloads data when changes occur.
 *
 * CommentLastReviewed: 2025-08-25
 */
@Component({
  selector: 'app-data-requests-consumer-page',
  imports: [
    FontAwesomeModule,
    I18nDirective,
    ButtonComponent,
    DataRequestTableComponent,
    ErrorOutletComponent,
    RouterOutlet,
  ],
  templateUrl: './data-requests-consumer.page.html',
})
export class DataRequestsConsumerPage {
  private readonly dataRequestService = inject(DataRequestService);
  private readonly errorService = inject(ErrorHandlerService);
  private readonly router = inject(Router);

  protected readonly ButtonVariants = ButtonVariants;
  protected readonly buttonIcon = faPlus;
  protected readonly icon = faDatabase;
  protected readonly stateService = inject(AgridataStateService);
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

  protected newRequest = () => {
    this.router.navigate([ROUTE_PATHS.DATA_REQUESTS_CONSUMER_PATH, DATA_REQUEST_NEW_ID]).then();
  };

  protected navigateToRequest = (request?: DataRequestDto | null) => {
    if (request?.id) {
      this.router.navigate([ROUTE_PATHS.DATA_REQUESTS_CONSUMER_PATH, request.id]).then();
    }
  };
}
