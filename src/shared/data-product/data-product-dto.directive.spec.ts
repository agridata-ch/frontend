import { DataProductDtoDirective } from './data-product-dto.directive';

describe('DataProductDtoDirective', () => {
  let directive: DataProductDtoDirective;

  beforeEach(() => {
    directive = new DataProductDtoDirective();
  });

  it('should create an instance', () => {
    expect(directive).toBeTruthy();
  });

  it('should return true from ngTemplateContextGuard', () => {
    const result = DataProductDtoDirective.ngTemplateContextGuard(directive, {});
    expect(result).toBe(true);
  });
});
