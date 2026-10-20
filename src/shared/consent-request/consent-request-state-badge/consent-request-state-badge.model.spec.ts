import { ConsentRequestAggregationStateEnum, ConsentRequestStateEnum } from '@/entities/openapi';
import { BadgeVariant } from '@/shared/ui/badge';

import { getConsentStateBadgeVariant } from './consent-request-state-badge.model';

describe('getConsentStateBadgeVariant', () => {
  it.each([
    [ConsentRequestStateEnum.Opened, BadgeVariant.INFO],
    [ConsentRequestStateEnum.Granted, BadgeVariant.SUCCESS],
    [ConsentRequestStateEnum.Declined, BadgeVariant.ERROR],
    [ConsentRequestStateEnum.LegallyPermitted, BadgeVariant.SUCCESS],
    [ConsentRequestStateEnum.NotCreated, BadgeVariant.DEFAULT],
    [ConsentRequestStateEnum.Withdrawn, BadgeVariant.DEFAULT],
    [ConsentRequestAggregationStateEnum.PartiallyOpened, BadgeVariant.WARNING],
    [ConsentRequestAggregationStateEnum.PartiallyGranted, BadgeVariant.SUCCESS],
    [undefined, BadgeVariant.DEFAULT],
  ])('maps %s to %s', (stateCode, variant) => {
    expect(getConsentStateBadgeVariant(stateCode)).toBe(variant);
  });
});
