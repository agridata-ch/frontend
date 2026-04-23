import { Component, inject, input } from '@angular/core';

import { DataRequestDto } from '@/entities/openapi';
import { AuthService } from '@/shared/lib/auth';

import { DataRequestWizardConsumerComponent } from './data-request-wizard-consumer/data-request-wizard-consumer.component';
import { DataRequestWizardProviderComponent } from './data-request-wizard-provider/data-request-wizard-provider.component';

/**
 * Wrapper component that renders the appropriate wizard based on user role.
 *
 * CommentLastReviewed: 2026-04-09
 */
@Component({
  selector: 'app-data-request-wizard',
  imports: [DataRequestWizardConsumerComponent, DataRequestWizardProviderComponent],
  templateUrl: './data-request-wizard.component.html',
})
export class DataRequestWizardComponent {
  protected readonly authService = inject(AuthService);

  readonly dataRequestId = input<string | undefined>();
  readonly initialDataRequest = input<DataRequestDto | undefined>();
  readonly isLoading = input<boolean>(false);

  protected readonly isDataConsumer = this.authService.isConsumer();
  protected readonly isDataProvider = this.authService.isDataProvider();
}
