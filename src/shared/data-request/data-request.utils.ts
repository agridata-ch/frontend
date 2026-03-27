import { DataRequestDto, DataRequestStateEnum } from '@/entities/openapi';
import { BadgeVariant } from '@/shared/ui/badge';

export function getBadgeVariant(stateCode?: string) {
  if (stateCode === DataRequestStateEnum.Draft) return BadgeVariant.INFO;
  if (stateCode === DataRequestStateEnum.InReview) return BadgeVariant.INFO;
  if (stateCode === DataRequestStateEnum.ToBeSignedByConsumer) return BadgeVariant.WARNING;
  if (stateCode === DataRequestStateEnum.ToBeReleasedByConsumer) return BadgeVariant.WARNING;
  if (stateCode === DataRequestStateEnum.ToBeSignedByProvider) return BadgeVariant.WARNING;
  if (stateCode === DataRequestStateEnum.Active) return BadgeVariant.SUCCESS;
  return BadgeVariant.DEFAULT;
}

export function getFieldFromLang<K extends keyof DataRequestDto>(
  field: K,
  lang: string,
  dataRequest: DataRequestDto,
) {
  const fieldValue = dataRequest?.[field];
  return (fieldValue as Record<string, string>)?.[lang] ?? '';
}
