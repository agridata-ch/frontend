import type { Mock } from 'vitest';

import { DataProductDto, DataProductDtoStateCode } from '@/entities/openapi';
import { I18nService } from '@/shared/i18n';
import { createMockI18nService, MockI18nService } from '@/shared/testing/mocks';
import { BadgeVariant } from '@/shared/ui/badge';

import {
  DATA_PRODUCT_DEPRECATED_STATE,
  getBadgeVariant,
  getDataProductState,
  getStatusTranslation,
} from './data-product-state.model';

describe('data-product-state.model', () => {
  const createProduct = (
    stateCode: DataProductDtoStateCode,
    deprecatedSince?: string,
  ): DataProductDto => ({
    consentRequired: false,
    deprecatedSince,
    id: 'product-id',
    stateCode,
  });

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

    it('returns WARNING for the deprecated state', () => {
      expect(getBadgeVariant(DATA_PRODUCT_DEPRECATED_STATE)).toBe(BadgeVariant.ERROR);
    });
  });

  describe('getDataProductState', () => {
    it('returns the deprecated state when deprecatedSince is set no matter the state code', () => {
      const product = createProduct(DataProductDtoStateCode.Active, '2026-03-06T00:00:00');
      expect(getDataProductState(product)).toBe(DATA_PRODUCT_DEPRECATED_STATE);
    });

    it('returns Active for a published product without a deprecatedSince value', () => {
      const product = createProduct(DataProductDtoStateCode.Active);
      expect(getDataProductState(product)).toBe(DataProductDtoStateCode.Active);
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

    it('calls translate with the deprecated key for the deprecated state', () => {
      getStatusTranslation(DATA_PRODUCT_DEPRECATED_STATE, i18nService as unknown as I18nService);
      expect(i18nService.translate).toHaveBeenCalledWith('data-product.stateCode.DEPRECATED');
    });

    it('returns the translated value', () => {
      (i18nService.translate as Mock).mockReturnValue('Entwurf');
      const result = getStatusTranslation('DRAFT', i18nService as unknown as I18nService);
      expect(result).toBe('Entwurf');
    });
  });
});
