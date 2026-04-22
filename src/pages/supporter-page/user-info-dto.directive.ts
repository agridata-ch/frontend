import { Directive } from '@angular/core';

import { UserInfoDto } from '@/entities/openapi';

/**
 * directive to ensure template variable is of type ConsentRequestProducerViewDto
 * CommentLastReviewed: 2025-09-23
 */
@Directive({
  selector: '[appUserInfoDtoGuard]',
})
export class UserInfoDtoDirective {
  static ngTemplateContextGuard(
    _dir: UserInfoDtoDirective,
    _ctx: unknown,
  ): _ctx is { $implicit: UserInfoDto } {
    return true;
  }
}
