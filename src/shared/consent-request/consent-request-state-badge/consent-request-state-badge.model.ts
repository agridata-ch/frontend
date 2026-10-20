import { ConsentRequestAggregationStateEnum, ConsentRequestStateEnum } from '@/entities/openapi';
import { BadgeVariant } from '@/shared/ui/badge';

type ConsentStateCode = ConsentRequestAggregationStateEnum | ConsentRequestStateEnum;

/**
 * Exhaustive by type, a new consent-request or aggregation state fails to compile until it gets a
 * variant. Codes shared by both enums carry the same variant, so one lookup serves both.
 */
const BADGE_VARIANTS: Record<ConsentStateCode, BadgeVariant> = {
  [ConsentRequestStateEnum.Opened]: BadgeVariant.INFO,
  [ConsentRequestStateEnum.Granted]: BadgeVariant.SUCCESS,
  [ConsentRequestStateEnum.Declined]: BadgeVariant.ERROR,
  [ConsentRequestStateEnum.LegallyPermitted]: BadgeVariant.SUCCESS,
  [ConsentRequestStateEnum.NotCreated]: BadgeVariant.DEFAULT,
  [ConsentRequestStateEnum.Withdrawn]: BadgeVariant.DEFAULT,
  [ConsentRequestAggregationStateEnum.PartiallyOpened]: BadgeVariant.WARNING,
  [ConsentRequestAggregationStateEnum.PartiallyGranted]: BadgeVariant.SUCCESS,
};

export function getConsentStateBadgeVariant(stateCode?: ConsentStateCode): BadgeVariant {
  return stateCode ? BADGE_VARIANTS[stateCode] : BadgeVariant.DEFAULT;
}
