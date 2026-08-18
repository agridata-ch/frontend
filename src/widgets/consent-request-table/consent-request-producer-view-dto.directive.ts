import { Directive } from '@angular/core';

import { ConsentRequestAggregationSummaryDto } from '@/entities/openapi';

/**
 * directive to ensure template variable is of type ConsentRequestAggregationSummaryDto
 * CommentLastReviewed: 2026-08-17
 */
@Directive({
  selector: '[appConsentRequestProducerViewDtoGuard]',
  standalone: true,
})
export class ConsentRequestProducerViewDtoDirective {
  static ngTemplateContextGuard(
    _dir: ConsentRequestProducerViewDtoDirective,
    _ctx: unknown,
  ): _ctx is { $implicit: ConsentRequestAggregationSummaryDto } {
    return true;
  }
}
