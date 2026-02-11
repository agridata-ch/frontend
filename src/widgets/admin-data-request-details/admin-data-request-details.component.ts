import { Component, inject, signal, viewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { ErrorHandlerService } from '@/app/error/error-handler.service';
import { DataRequestService } from '@/entities/api';
import { DataRequestStateEnum } from '@/entities/openapi';
import { I18nDirective } from '@/shared/i18n';
import { ButtonComponent, ButtonVariants } from '@/shared/ui/button';
import { DataRequestDetailsComponent } from '@/widgets/data-request-details';

/**
 * Admin page for viewing data request details with action buttons.
 * Wraps the reusable details component and provides accept, reject, and activate actions.
 *
 * CommentLastReviewed: 2026-02-11
 */
@Component({
  selector: 'app-admin-data-request-details',
  imports: [ButtonComponent, DataRequestDetailsComponent, I18nDirective],
  templateUrl: './admin-data-request-details.html',
})
export class AdminDataRequestDetailsComponent {
  // Injects
  private readonly dataRequestService = inject(DataRequestService);
  private readonly errorService = inject(ErrorHandlerService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  // Constants
  protected readonly ButtonVariants = ButtonVariants;
  protected readonly DataRequestStateEnum = DataRequestStateEnum;

  // Signals
  private readonly refreshListNeeded = signal(false);

  // View Children
  private readonly detailsComponent = viewChild.required(DataRequestDetailsComponent);

  protected get dataRequestId(): string {
    return this.route.snapshot.params['dataRequestId'];
  }

  protected acceptRequest(): void {
    this.dataRequestService
      .approveDataRequest(this.dataRequestId)
      .then(() => {
        this.refreshListNeeded.set(true);
        this.detailsComponent().dataRequestResource.reload();
      })
      .catch((error) => this.errorService.handleError(error));
  }

  protected activateRequest(): void {
    this.dataRequestService
      .activateDataRequest(this.dataRequestId)
      .then(() => {
        this.refreshListNeeded.set(true);
        this.detailsComponent().dataRequestResource.reload();
      })
      .catch((error) => this.errorService.handleError(error));
  }

  protected handleClose(): void {
    this.router.navigate(['..'], {
      relativeTo: this.route,
      state: { refresh: this.refreshListNeeded() },
    });
  }

  protected rejectRequest(): void {
    this.dataRequestService
      .retreatDataRequest(this.dataRequestId)
      .then(() => {
        this.refreshListNeeded.set(true);
        this.handleClose();
      })
      .catch((error) => this.errorService.handleError(error));
  }
}
