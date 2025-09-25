import { Directive } from '@angular/core';

import { DataRequestDto } from '@/entities/openapi';

/**
 * directive to ensure template variable is of type DataRequestDto
 * CommentLastReviewed: 2025-09-23
 */
@Directive({
  selector: '[appDataRequestDtoGuard]',
  standalone: true,
})
export class DataRequestDtoDirective {
  static ngTemplateContextGuard(
    dir: DataRequestDtoDirective,
    ctx: unknown,
  ): ctx is { $implicit: DataRequestDto } {
    return true;
  }
}
