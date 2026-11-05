import { formatDate } from '@/shared/date/date-utils';
import { I18nService } from '@/shared/i18n';

export function getStateTranslation(
  i18nService: I18nService,
  stateCode?: string,
  terminationPeriodUntil?: string,
): string {
  if (!stateCode) return '';
  return i18nService.translate(`data-request.stateCode.${stateCode}`, {
    date: formatDate(terminationPeriodUntil),
  });
}
