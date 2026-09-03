import { ConsentRequestProducerViewDtoDirective } from './consent-request-producer-view-dto.directive';

describe('ConsentRequestProducerViewDtoDirective', () => {
  it('narrows the template context type via the static guard', () => {
    expect(
      ConsentRequestProducerViewDtoDirective.ngTemplateContextGuard(
        new ConsentRequestProducerViewDtoDirective(),
        {},
      ),
    ).toBe(true);
  });
});
