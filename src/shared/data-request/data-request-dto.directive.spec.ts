import { DataRequestDtoDirective } from './data-request-dto.directive';

describe('DataRequestDtoDirective', () => {
  let directive: DataRequestDtoDirective;

  beforeEach(() => {
    directive = new DataRequestDtoDirective();
  });

  it('should create an instance', () => {
    expect(directive).toBeTruthy();
  });

  it('should return true from ngTemplateContextGuard', () => {
    const result = DataRequestDtoDirective.ngTemplateContextGuard(directive, {});
    expect(result).toBe(true);
  });
});
