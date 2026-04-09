import { Component, inject, input, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { DataRequestStateEnum } from '@/entities/openapi';
import { I18nDirective } from '@/shared/i18n';
import { ButtonVariants } from '@/shared/ui/button';
import { DataRequestDetailsComponent } from '@/widgets/data-request-details';

import { DataRequestDetailsWrapperComponent } from '../data-request-details-wrapper/data-request-details-wrapper.component';

/**
 * Provider page for viewing data request details with action buttons.
 * Wraps the reusable details component.
 *
 * CommentLastReviewed: 2026-02-16
 */
@Component({
  selector: 'app-provider-data-request-details',
  imports: [DataRequestDetailsComponent, I18nDirective, DataRequestDetailsWrapperComponent],
  templateUrl: './provider-data-request-details.html',
})
export class ProviderDataRequestDetailsComponent {
  // Injects
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly dataRequestId = input.required<string>();

  // Constants
  protected readonly ButtonVariants = ButtonVariants;
  protected readonly DataRequestStateEnum = DataRequestStateEnum;

  // Signals
  private readonly refreshListNeeded = signal(false);

  protected handleClose(): void {
    this.router.navigate(['..'], {
      relativeTo: this.route,
      state: { refresh: this.refreshListNeeded() },
    });
  }
}
