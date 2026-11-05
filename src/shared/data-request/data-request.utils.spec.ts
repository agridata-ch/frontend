import { DataRequestStateEnum } from '@/entities/openapi';
import { I18nService } from '@/shared/i18n';
import { createMockI18nService } from '@/shared/testing/mocks';

import { getStateTranslation } from './data-request.utils';

describe('getStateTranslation', () => {
  const i18nService = createMockI18nService() as unknown as I18nService;

  beforeEach(() => vi.clearAllMocks());

  it('should return an empty string without a state code', () => {
    expect(getStateTranslation(i18nService)).toBe('');
  });

  it('should pass an undefined date param when there is no expiry date', () => {
    getStateTranslation(i18nService, DataRequestStateEnum.Active);

    expect(i18nService.translate).toHaveBeenCalledWith('data-request.stateCode.ACTIVE', {
      date: undefined,
    });
  });

  it('should pass the formatted termination expiry date as param', () => {
    getStateTranslation(i18nService, DataRequestStateEnum.TerminationPending, '2027-01-14');

    expect(i18nService.translate).toHaveBeenCalledWith(
      'data-request.stateCode.TERMINATION_PENDING',
      { date: '14.01.2027' },
    );
  });
});
