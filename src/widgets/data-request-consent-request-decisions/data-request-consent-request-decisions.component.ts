import { Component, computed, inject, input } from '@angular/core';
import { faEdit, faInfoCircle } from '@awesome.me/kit-0b6d1ed528/icons/classic/regular';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

import { ConsentRequestAggregationStateEnum } from '@/entities/openapi';
import {
  ConsentRequestDecisionStore,
  ConsentRequestStateBadgeComponent,
  getConsentRequestBadgeVariant,
} from '@/shared/consent-request';
import { I18nDirective } from '@/shared/i18n';
import { TooltipDirective } from '@/shared/tooltip';
import { AgridataToggleComponent } from '@/shared/ui/agridata-toggle';
import { AlertComponent, AlertType } from '@/shared/ui/alert';
import { ButtonComponent, ButtonVariants } from '@/shared/ui/button';

/**
 * Lists a consent-request aggregation's children split into a BUR-based group and a UID-based group.
 * The UID group is always read-only. The BUR group can be switched into an
 * edit mode where each child gets an accept/decline toggle; the staged toggle state lives in the
 * injected store and is submitted by the details panel footer. Outside the details panel (no store)
 * or when the aggregation has no children it shows a non-producer info message.
 *
 * CommentLastReviewed: 2026-10-06
 */
@Component({
  selector: 'app-data-request-consent-request-decisions',
  imports: [
    AgridataToggleComponent,
    ButtonComponent,
    ConsentRequestStateBadgeComponent,
    I18nDirective,
    AlertComponent,
    FontAwesomeModule,
    TooltipDirective,
  ],
  templateUrl: './data-request-consent-request-decisions.component.html',
})
export class DataRequestConsentRequestDecisionsComponent {
  // Injects
  protected readonly store = inject(ConsentRequestDecisionStore, { optional: true });

  // Inputs
  readonly burPresent = input<boolean>(false);
  readonly consumerName = input<string>();

  // Constants
  protected readonly AlertType = AlertType;
  protected readonly ButtonVariants = ButtonVariants;
  protected readonly ConsentRequestAggregationStateEnum = ConsentRequestAggregationStateEnum;
  protected readonly getConsentRequestBadgeVariant = getConsentRequestBadgeVariant;
  protected readonly editIcon = faEdit;
  protected readonly infoIcon = faInfoCircle;

  // Computed Signals
  protected readonly descriptionKey = computed(() => {
    if (!this.burPresent()) {
      return 'description.noBur';
    }
    return this.store?.burRequests().length === 1
      ? 'description.singleBur'
      : 'description.multipleBur';
  });
}
