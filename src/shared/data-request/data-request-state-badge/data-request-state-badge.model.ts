import { DataRequestStateEnum } from '@/entities/openapi';
import { BadgeVariant } from '@/shared/ui/badge';

/** Exhaustive by type, a new data request state fails to compile until it gets a variant. */
const BADGE_VARIANTS: Record<DataRequestStateEnum, BadgeVariant> = {
  [DataRequestStateEnum.Draft]: BadgeVariant.INFO,
  [DataRequestStateEnum.InReview]: BadgeVariant.INFO,
  [DataRequestStateEnum.ToBeSignedByConsumer]: BadgeVariant.WARNING,
  [DataRequestStateEnum.ToBeReleasedByConsumer]: BadgeVariant.WARNING,
  [DataRequestStateEnum.ToBeSignedByProvider]: BadgeVariant.WARNING,
  [DataRequestStateEnum.ToBeReleasedByProvider]: BadgeVariant.WARNING,
  [DataRequestStateEnum.ToBeActivated]: BadgeVariant.WARNING,
  [DataRequestStateEnum.Active]: BadgeVariant.SUCCESS,
  [DataRequestStateEnum.Paused]: BadgeVariant.WARNING,
  [DataRequestStateEnum.TerminationPending]: BadgeVariant.WARNING,
  [DataRequestStateEnum.Terminated]: BadgeVariant.DEFAULT,
};

export function getDataRequestStateBadgeVariant(stateCode?: DataRequestStateEnum): BadgeVariant {
  return stateCode ? BADGE_VARIANTS[stateCode] : BadgeVariant.DEFAULT;
}
