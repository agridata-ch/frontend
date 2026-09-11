import { UserInfoDtoDirective } from './user-info-dto.directive';

describe('UserInfoDtoDirective', () => {
  it('narrows the template context type via the static guard', () => {
    expect(UserInfoDtoDirective.ngTemplateContextGuard(new UserInfoDtoDirective(), {})).toBe(true);
  });
});
