import { Directive } from '@angular/core';

import { ConsentRequestFundamentalViewDto } from '@/entities/openapi';

/**
 * directive to ensure template variable is of type ConsentRequestFundamentalViewDto
 * CommentLastReviewed: 2026-09-11
 */
@Directive({
  selector: '[appConsentRequestFundamentalViewDtoGuard]',
})
export class ConsentRequestFundamentalViewDtoDirective {
  static ngTemplateContextGuard(
    _dir: ConsentRequestFundamentalViewDtoDirective,
    _ctx: unknown,
  ): _ctx is { $implicit: ConsentRequestFundamentalViewDto } {
    return true;
  }
}
