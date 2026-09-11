import { DataProductDto, DataProductDtoStateCode } from '@/entities/openapi';
import { I18nService } from '@/shared/i18n';
import { BadgeVariant } from '@/shared/ui/badge';

// TODO: DIGIB2-1677 add stateCode DEPRECATED to DataProductDtoStateCode and remove this constant
export const DATA_PRODUCT_DEPRECATED_STATE = 'DEPRECATED';

export type DataProductState = DataProductDtoStateCode | typeof DATA_PRODUCT_DEPRECATED_STATE;

export function getBadgeVariant(stateCode?: string) {
  if (stateCode === DataProductDtoStateCode.Draft) return BadgeVariant.INFO;
  if (stateCode === DataProductDtoStateCode.Active) return BadgeVariant.SUCCESS;
  if (stateCode === DATA_PRODUCT_DEPRECATED_STATE) return BadgeVariant.WARNING;
  return BadgeVariant.DEFAULT;
}

/** Deprecation is not a state code - it is derived from `deprecatedSince`. */
// TODO: DIGIB2-1677 use `product.stateCode` directly
export function getDataProductState(product?: DataProductDto): DataProductState | undefined {
  if (product?.deprecatedSince) return DATA_PRODUCT_DEPRECATED_STATE;
  return product?.stateCode;
}

export function getStatusTranslation(value: string | undefined, i18nService: I18nService) {
  if (!value) return '';
  return i18nService.translate(`data-product.stateCode.${value}`);
}
