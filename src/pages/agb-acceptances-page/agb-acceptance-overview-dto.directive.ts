import { Directive } from '@angular/core';

import { AgbAcceptanceOverviewDto } from '@/entities/openapi';

/**
 * Directive to ensure the template variable is of type AgbAcceptanceOverviewDto.
 *
 * CommentLastReviewed: 2026-10-29
 */
@Directive({
  selector: '[appAgbAcceptanceOverviewDtoGuard]',
})
export class AgbAcceptanceOverviewDtoDirective {
  static ngTemplateContextGuard(
    _dir: AgbAcceptanceOverviewDtoDirective,
    _ctx: unknown,
  ): _ctx is { $implicit: AgbAcceptanceOverviewDto } {
    return true;
  }
}
