import { DataProductDtoStateCode } from '@/entities/openapi';
import { I18nService } from '@/shared/i18n';
import { BadgeVariant } from '@/shared/ui/badge';

export function getBadgeVariant(stateCode?: string) {
  if (stateCode === DataProductDtoStateCode.Draft) return BadgeVariant.INFO;
  if (stateCode === DataProductDtoStateCode.Active) return BadgeVariant.SUCCESS;
  return BadgeVariant.DEFAULT;
}

export function getStatusTranslation(value: string | undefined, i18nService: I18nService) {
  if (!value) return '';
  return i18nService.translate(`data-product.stateCode.${value}`);
}
