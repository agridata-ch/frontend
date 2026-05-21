import { Directive } from '@angular/core';

import { DataProductDto } from '@/entities/openapi';

/**
 * directive to ensure template variable is of type DataProductDto
 * CommentLastReviewed: 2026-05-13
 */
@Directive({
  selector: '[appDataProductDtoGuard]',
})
export class DataProductDtoDirective {
  static ngTemplateContextGuard(
    _dir: DataProductDtoDirective,
    _ctx: unknown,
  ): _ctx is { $implicit: DataProductDto } {
    return true;
  }
}
