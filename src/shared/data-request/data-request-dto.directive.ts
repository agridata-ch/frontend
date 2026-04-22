import { Directive } from '@angular/core';

import { DataRequestDto } from '@/entities/openapi';

/**
 * directive to ensure template variable is of type DataRequestDto
 * CommentLastReviewed: 2026-01-06
 */
@Directive({
  selector: '[appDataRequestDtoGuard]',
  standalone: true,
})
export class DataRequestDtoDirective {
  static ngTemplateContextGuard(
    _dir: DataRequestDtoDirective,
    _ctx: unknown,
  ): _ctx is { $implicit: DataRequestDto } {
    return true;
  }
}
