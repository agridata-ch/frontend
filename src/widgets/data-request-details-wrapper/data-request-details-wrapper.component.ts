import { Component, computed, inject, input, resource } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { ErrorHandlerService } from '@/app/error/error-handler.service';
import { DataRequestService } from '@/entities/api';
import { createResourceErrorHandlerEffect } from '@/shared/lib/api.helper';
import { DataRequestDetailsComponent } from '@/widgets/data-request-details';
import { DATA_REQUEST_NEW_ID, DataRequestWizardComponent } from '@/widgets/data-request-wizard';

/**
 * Fetches the data request by ID and renders the appropriate child component based on its state.
 * Passes the resolved DataRequestDto down so child components don't duplicate fetch logic.
 *
 * CommentLastReviewed: 2026-02-11
 */
@Component({
  selector: 'app-data-request-details-wrapper',
  imports: [DataRequestDetailsComponent, DataRequestWizardComponent],
  templateUrl: './data-request-details-wrapper.component.html',
})
export class DataRequestDetailsWrapperComponent {
  // Injects
  private readonly dataRequestService = inject(DataRequestService);
  private readonly errorService = inject(ErrorHandlerService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  // Input properties
  readonly dataRequestId = input.required<string>();

  // Computed Signals
  protected readonly dataRequest = computed(() => {
    if (this.dataRequestsResource.isLoading()) {
      return undefined;
    }
    return this.dataRequestsResource.value();
  });

  protected readonly isLoading = computed(() => this.dataRequestsResource.isLoading());

  protected readonly shouldShowActiveComponent = computed(
    () => this.dataRequest()?.stateCode === 'ACTIVE',
  );

  // Resources
  protected readonly dataRequestsResource = resource({
    params: () => ({ id: this.dataRequestId() }),
    loader: ({ params }) => {
      if (!params?.id || params.id === DATA_REQUEST_NEW_ID) {
        return Promise.resolve(undefined);
      }
      return this.dataRequestService.fetchDataRequest(params.id);
    },
  });

  // Effects
  private readonly errorHandlerEffect = createResourceErrorHandlerEffect(
    this.dataRequestsResource,
    this.errorService,
  );

  /**
   * Handles close event from data-request-details component.
   * Note: data-request-new handles its own navigation because it tracks refreshListNeeded state.
   */
  protected handleSidepanelClose(): void {
    this.router.navigate(['..'], { relativeTo: this.route });
  }
}
