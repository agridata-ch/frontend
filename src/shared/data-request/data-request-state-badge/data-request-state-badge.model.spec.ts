import { DataRequestStateEnum } from '@/entities/openapi';
import { BadgeVariant } from '@/shared/ui/badge';

import { getDataRequestStateBadgeVariant } from './data-request-state-badge.model';

describe('getDataRequestStateBadgeVariant', () => {
  it.each([
    [DataRequestStateEnum.Draft, BadgeVariant.INFO],
    [DataRequestStateEnum.InReview, BadgeVariant.INFO],
    [DataRequestStateEnum.ToBeSignedByConsumer, BadgeVariant.WARNING],
    [DataRequestStateEnum.ToBeReleasedByConsumer, BadgeVariant.WARNING],
    [DataRequestStateEnum.ToBeSignedByProvider, BadgeVariant.WARNING],
    [DataRequestStateEnum.ToBeReleasedByProvider, BadgeVariant.WARNING],
    [DataRequestStateEnum.ToBeActivated, BadgeVariant.WARNING],
    [DataRequestStateEnum.Active, BadgeVariant.SUCCESS],
    [DataRequestStateEnum.Paused, BadgeVariant.WARNING],
    [DataRequestStateEnum.TerminationPending, BadgeVariant.WARNING],
    [DataRequestStateEnum.Terminated, BadgeVariant.DEFAULT],
    [undefined, BadgeVariant.DEFAULT],
  ])('maps %s to %s', (stateCode, variant) => {
    expect(getDataRequestStateBadgeVariant(stateCode)).toBe(variant);
  });
});
