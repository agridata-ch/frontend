import { DataProductDtoStateCode } from '@/entities/openapi';
import { I18nService } from '@/shared/i18n';
import { createMockI18nService, MockI18nService } from '@/shared/testing/mocks';
import { BadgeVariant } from '@/shared/ui/badge';

import { getBadgeVariant, getStatusTranslation } from './data-products-page.model';

describe('data-products-page.model', () => {
  describe('getBadgeVariant', () => {
    it('returns INFO for Draft state', () => {
      expect(getBadgeVariant(DataProductDtoStateCode.Draft)).toBe(BadgeVariant.INFO);
    });

    it('returns SUCCESS for Active state', () => {
      expect(getBadgeVariant(DataProductDtoStateCode.Active)).toBe(BadgeVariant.SUCCESS);
    });

    it('returns DEFAULT for an unknown state code', () => {
      expect(getBadgeVariant('UNKNOWN')).toBe(BadgeVariant.DEFAULT);
    });

    it('returns DEFAULT for undefined', () => {
      expect(getBadgeVariant(undefined)).toBe(BadgeVariant.DEFAULT);
    });
  });

  describe('getStatusTranslation', () => {
    let i18nService: MockI18nService;

    beforeEach(() => {
      i18nService = createMockI18nService();
    });

    it('returns empty string for an empty value', () => {
      const result = getStatusTranslation('', i18nService as unknown as I18nService);
      expect(result).toBe('');
      expect(i18nService.translate).not.toHaveBeenCalled();
    });

    it('calls translate with the correct key for a given state code', () => {
      getStatusTranslation('DRAFT', i18nService as unknown as I18nService);
      expect(i18nService.translate).toHaveBeenCalledWith('data-product.stateCode.DRAFT');
    });

    it('returns the translated value', () => {
      (i18nService.translate as jest.Mock).mockReturnValue('Entwurf');
      const result = getStatusTranslation('DRAFT', i18nService as unknown as I18nService);
      expect(result).toBe('Entwurf');
    });
  });
});
