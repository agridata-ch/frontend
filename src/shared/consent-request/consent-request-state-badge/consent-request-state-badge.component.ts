import { Component, computed, inject, input } from '@angular/core';

import { ConsentRequestAggregationStateEnum, ConsentRequestStateEnum } from '@/entities/openapi';
import { formatDate } from '@/shared/date';
import { I18nPipe } from '@/shared/i18n';
import { I18nService } from '@/shared/i18n/i18n.service';
import { TooltipDirective } from '@/shared/tooltip';
import { AgridataBadgeComponent, BadgeSize, BadgeVariant } from '@/shared/ui/badge';

/** States that carry a decision date, shown in the tooltip. */
const DATED_STATES = new Set<string>([
  ConsentRequestAggregationStateEnum.Granted,
  ConsentRequestAggregationStateEnum.PartiallyGranted,
  ConsentRequestAggregationStateEnum.Declined,
  ConsentRequestAggregationStateEnum.LegallyPermitted,
]);

/**
 * Badge showing the state of a consent request or consent-request aggregation. States that carry a
 * decision date (granted, partially granted, declined, legally permitted) get a tooltip.
 *
 * CommentLastReviewed: 2026-10-06
 */
@Component({
  selector: 'app-consent-request-state-badge',
  imports: [AgridataBadgeComponent, I18nPipe, TooltipDirective],
  templateUrl: './consent-request-state-badge.component.html',
  host: { class: 'inline-flex' },
})
export class ConsentRequestStateBadgeComponent {
  // Injects
  private readonly i18nService = inject(I18nService);

  // Inputs
  readonly lastStateChangeDate = input<string>();
  readonly size = input<BadgeSize>(BadgeSize.MD);
  readonly stateCode = input<ConsentRequestStateEnum | ConsentRequestAggregationStateEnum>();
  readonly variant = input<BadgeVariant>(BadgeVariant.DEFAULT);

  // Computed Signals
  protected readonly labelKey = computed(() => {
    const stateCode = this.stateCode();
    return stateCode
      ? `consent-request.dataRequest.stateCode.${stateCode}`
      : 'consent-request.details.stateCode.UNKNOWN';
  });
  protected readonly tooltip = computed(() => {
    const stateCode = this.stateCode();
    if (!stateCode || !DATED_STATES.has(stateCode)) {
      return '';
    }
    return this.i18nService.translate(`consent-request.details.stateCode.${stateCode}`, {
      date: formatDate(this.lastStateChangeDate()),
    });
  });
}
