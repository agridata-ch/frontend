import { Directive } from '@angular/core';

import { ConsentRequestAggregationProducerView } from '@/entities/openapi';

/**
 * directive to ensure template variable is of type ConsentRequestAggregationProducerView
 * CommentLastReviewed: 2026-08-07
 */
@Directive({
  selector: '[appConsentRequestProducerViewDtoGuard]',
  standalone: true,
})
export class ConsentRequestProducerViewDtoDirective {
  static ngTemplateContextGuard(
    _dir: ConsentRequestProducerViewDtoDirective,
    _ctx: unknown,
  ): _ctx is { $implicit: ConsentRequestAggregationProducerView } {
    return true;
  }
}
