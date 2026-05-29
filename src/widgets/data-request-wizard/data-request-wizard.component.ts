import { computed, Component, inject, input } from '@angular/core';

import { AgridataStateService } from '@/entities/api/agridata-state.service';
import { DataRequestDto } from '@/entities/openapi';
import { ACTING_ROLES } from '@/shared/constants/constants';

import { DataRequestWizardConsumerComponent } from './data-request-wizard-consumer/data-request-wizard-consumer.component';
import { DataRequestWizardProviderComponent } from './data-request-wizard-provider/data-request-wizard-provider.component';

/**
 * Wrapper component that renders the appropriate wizard based on the current route.
 *
 * CommentLastReviewed: 2026-05-29
 */
@Component({
  selector: 'app-data-request-wizard',
  imports: [DataRequestWizardConsumerComponent, DataRequestWizardProviderComponent],
  templateUrl: './data-request-wizard.component.html',
})
export class DataRequestWizardComponent {
  private readonly stateService = inject(AgridataStateService);

  readonly dataRequestId = input<string | undefined>();
  readonly initialDataRequest = input<DataRequestDto | undefined>();
  readonly isLoading = input<boolean>(false);

  protected readonly showProviderWizard = computed(
    () => this.stateService.actingRole() === ACTING_ROLES.PROVIDER,
  );
}
