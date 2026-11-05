import { Component, computed, inject, input } from '@angular/core';

import { DataRequestStateEnum } from '@/entities/openapi';
import { I18nService } from '@/shared/i18n/i18n.service';
import { AgridataBadgeComponent, BadgeSize } from '@/shared/ui/badge';

import { getStateTranslation } from '../data-request.utils';
import { getDataRequestStateBadgeVariant } from './data-request-state-badge.model';

/**
 * Badge showing the state of a data request. A pending termination shows the end of the notice period.
 *
 * CommentLastReviewed: 2026-10-19
 */
@Component({
  selector: 'app-data-request-state-badge',
  imports: [AgridataBadgeComponent],
  templateUrl: './data-request-state-badge.component.html',
  host: { class: 'contents' },
})
export class DataRequestStateBadgeComponent {
  // Injects
  private readonly i18nService = inject(I18nService);

  // Inputs
  readonly size = input<BadgeSize>(BadgeSize.MD);
  readonly stateCode = input<DataRequestStateEnum>();
  readonly terminationPeriodUntil = input<string>();

  // Computed Signals
  protected readonly text = computed(() =>
    getStateTranslation(this.i18nService, this.stateCode(), this.terminationPeriodUntil()),
  );
  protected readonly variant = computed(() => getDataRequestStateBadgeVariant(this.stateCode()));
}
