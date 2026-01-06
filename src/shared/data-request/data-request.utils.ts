import {
  ConsentRequestProducerViewDtoDataRequestStateCode,
  DataRequestStateEnum,
} from '@/entities/openapi';
import { BadgeVariant } from '@/shared/ui/badge';

export function getBadgeVariant(
  stateCode: ConsentRequestProducerViewDtoDataRequestStateCode | undefined,
) {
  if (stateCode === DataRequestStateEnum.Draft) return BadgeVariant.INFO;
  if (stateCode === DataRequestStateEnum.InReview) return BadgeVariant.INFO;
  if (stateCode === DataRequestStateEnum.ToBeSigned) return BadgeVariant.WARNING;
  if (stateCode === DataRequestStateEnum.Active) return BadgeVariant.SUCCESS;
  return BadgeVariant.DEFAULT;
}
