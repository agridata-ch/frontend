import { ConsentRequestStateEnum } from '@/entities/openapi';
import { ToastType } from '@/shared/toast';

import { getToastMessage, getToastTitle, getToastType } from './consent-request.utils';

describe('Toast Utilities', () => {
  describe('getToastTitle()', () => {
    it('returns "Einwilligung erteilt" for Granted', () => {
      const title = getToastTitle(ConsentRequestStateEnum.Granted);
      expect(title).toBe('Einwilligung erteilt');
    });

    it('returns "Einwilligung abgelehnt" for Declined', () => {
      const title = getToastTitle(ConsentRequestStateEnum.Declined);
      expect(title).toBe('Einwilligung abgelehnt');
    });

    it('returns default title for any other state', () => {
      const title1 = getToastTitle('SomeOtherState');
      expect(title1).toBe('Antrag aktualisiert');

      const title2 = getToastTitle('');
      expect(title2).toBe('Antrag aktualisiert');
    });
  });

  describe('getToastMessage()', () => {
    it('returns Granted message with requestName when provided', () => {
      const msg = getToastMessage(ConsentRequestStateEnum.Granted, 'TestRequest');
      expect(msg).toBe('Du hast den Antrag TestRequest erfolgreich eingewilligt.');
    });

    it('returns Granted message with empty name when requestName is undefined', () => {
      const msg = getToastMessage(ConsentRequestStateEnum.Granted);
      expect(msg).toBe('Du hast den Antrag  erfolgreich eingewilligt.');
    });

    it('returns Declined message with requestName when provided', () => {
      const msg = getToastMessage(ConsentRequestStateEnum.Declined, 'AnotherRequest');
      expect(msg).toBe('Du hast den Antrag AnotherRequest erfolgreich abgelehnt.');
    });

    it('returns Declined message with empty name when requestName is undefined', () => {
      const msg = getToastMessage(ConsentRequestStateEnum.Declined);
      expect(msg).toBe('Du hast den Antrag  erfolgreich abgelehnt.');
    });

    it('returns default message for any other state', () => {
      const msg1 = getToastMessage('UnknownState', 'X');
      expect(msg1).toBe('Der Antrag wurde aktualisiert.');

      const msg2 = getToastMessage('');
      expect(msg2).toBe('Der Antrag wurde aktualisiert.');
    });
  });

  describe('getToastType()', () => {
    it('returns ToastType.Success for Granted', () => {
      const type = getToastType(ConsentRequestStateEnum.Granted);
      expect(type).toBe(ToastType.Success);
    });

    it('returns ToastType.Error for Declined', () => {
      const type = getToastType(ConsentRequestStateEnum.Declined);
      expect(type).toBe(ToastType.Error);
    });

    it('returns ToastType.Info for any other state', () => {
      const type1 = getToastType('RandomState');
      expect(type1).toBe(ToastType.Info);

      const type2 = getToastType('');
      expect(type2).toBe(ToastType.Info);
    });
  });
});
