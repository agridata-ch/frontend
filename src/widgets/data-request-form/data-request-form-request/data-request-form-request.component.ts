import { Component, computed, inject, input } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { faSpinnerThird } from '@awesome.me/kit-0b6d1ed528/icons/duotone/solid';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

import { MasterDataService } from '@/entities/api/master-data.service';
import { I18nDirective } from '@/shared/i18n';

import { DataRequestAdvantagesComponent } from './data-request-advantages';
import { DataRequestDescriptionComponent } from './data-request-description';
import { DataRequestProductComponent } from './data-request-product';

/**
 * Composes the request step of the data request form. Delegates product selection,
 * multilingual descriptions, and advantages management to dedicated sub-components.
 *
 * CommentLastReviewed: 2026-06-18
 */
@Component({
  selector: 'app-data-request-form-request',
  imports: [
    DataRequestAdvantagesComponent,
    DataRequestDescriptionComponent,
    DataRequestProductComponent,
    FontAwesomeModule,
    I18nDirective,
    ReactiveFormsModule,
  ],
  templateUrl: './data-request-form-request.component.html',
})
export class DataRequestFormRequestComponent {
  // Injects
  private readonly masterDataService = inject(MasterDataService);

  // Constants
  protected readonly faSpinnerThird = faSpinnerThird;

  // Input properties
  readonly dataProviderId = input<string>();
  readonly form = input<FormGroup>();
  readonly formDisabled = input<boolean>(false);

  // Computed Signals
  protected readonly providerLoading = computed(() => this.masterDataService.providersLoading());
}
