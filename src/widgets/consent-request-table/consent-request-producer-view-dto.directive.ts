import { Directive } from '@angular/core';

import { ConsentRequestProducerViewDto } from '@/entities/openapi';

/**
 * directive to ensure template variable is of type ConsentRequestProducerViewDto
 * CommentLastReviewed: 2025-09-23
 */
@Directive({
  selector: '[appConsentRequestProducerViewDtoGuard]',
  standalone: true,
})
export class ConsentRequestProducerViewDtoDirective {
  static ngTemplateContextGuard(
    dir: ConsentRequestProducerViewDtoDirective,
    ctx: unknown,
  ): ctx is { $implicit: ConsentRequestProducerViewDto } {
    return true;
  }
}
