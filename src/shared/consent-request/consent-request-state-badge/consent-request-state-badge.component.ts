import { Component, computed, inject, input } from '@angular/core';

import { ConsentRequestAggregationStateEnum, ConsentRequestStateEnum } from '@/entities/openapi';
import { getConsentStateTranslation } from '@/shared/consent-request/consent-request.utils';
import { formatDate } from '@/shared/date';
import { I18nService } from '@/shared/i18n/i18n.service';
import { TooltipDirective } from '@/shared/tooltip';
import { AgridataBadgeComponent, BadgeSize } from '@/shared/ui/badge';

import { getConsentStateBadgeVariant } from './consent-request-state-badge.model';

/** States that carry a decision date, shown in the tooltip. */
const DATED_STATES = new Set<string>([
  ConsentRequestAggregationStateEnum.Granted,
  ConsentRequestAggregationStateEnum.PartiallyGranted,
  ConsentRequestAggregationStateEnum.Declined,
  ConsentRequestAggregationStateEnum.LegallyPermitted,
]);

/**
 * Badge showing the state of a consent request or consent-request aggregation. States that carry a
 * decision date (granted, partially granted, declined, legally permitted) get a tooltip when a date is passed.
 *
 * CommentLastReviewed: 2026-10-06
 */
@Component({
  selector: 'app-consent-request-state-badge',
  imports: [AgridataBadgeComponent, TooltipDirective],
  templateUrl: './consent-request-state-badge.component.html',
  host: { class: 'contents' },
})
export class ConsentRequestStateBadgeComponent {
  // Injects
  private readonly i18nService = inject(I18nService);

  // Inputs
  readonly lastStateChangeDate = input<string>();
  readonly size = input<BadgeSize>(BadgeSize.MD);
  readonly stateCode = input<ConsentRequestStateEnum | ConsentRequestAggregationStateEnum>();

  // Computed Signals
  protected readonly text = computed(() =>
    getConsentStateTranslation(this.i18nService, this.stateCode()),
  );
  protected readonly variant = computed(() => getConsentStateBadgeVariant(this.stateCode()));
  protected readonly tooltip = computed(() => {
    const stateCode = this.stateCode();
    if (!stateCode || !DATED_STATES.has(stateCode) || !this.lastStateChangeDate()) {
      return '';
    }
    return this.i18nService.translate(`consent-request.stateCode.tooltip.${stateCode}`, {
      date: formatDate(this.lastStateChangeDate()),
    });
  });
}
