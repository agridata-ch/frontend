import { ConsentRequestStateEnum } from '@/entities/openapi';
import { ToastType } from '@/shared/toast';

import { getToastMessage, getToastTitle, getToastType } from './consent-request.utils';

describe('Toast Utilities', () => {
  describe('getToastTitle()', () => {
    it('returns "consent-request.toast.title.GRANTED" for Granted', () => {
      const title = getToastTitle(ConsentRequestStateEnum.Granted);
      expect(title).toBe('consent-request.toast.title.GRANTED');
    });

    it('returns "consent-request.toast.title.DECLINED" for Declined', () => {
      const title = getToastTitle(ConsentRequestStateEnum.Declined);
      expect(title).toBe('consent-request.toast.title.DECLINED');
    });

    it('returns default title for any other state', () => {
      const title1 = getToastTitle('SomeOtherState');
      expect(title1).toBe('consent-request.toast.title.DEFAULT');

      const title2 = getToastTitle('');
      expect(title2).toBe('consent-request.toast.title.DEFAULT');
    });
  });

  describe('getToastMessage()', () => {
    it('returns Granted key', () => {
      const msg = getToastMessage(ConsentRequestStateEnum.Granted);
      expect(msg).toBe('consent-request.toast.message.GRANTED');
    });

    it('returns Declined key', () => {
      const msg = getToastMessage(ConsentRequestStateEnum.Declined);
      expect(msg).toBe('consent-request.toast.message.DECLINED');
    });

    it('returns default message for any other state', () => {
      const msg1 = getToastMessage('UnknownState');
      expect(msg1).toBe('consent-request.toast.message.DEFAULT');

      const msg2 = getToastMessage('');
      expect(msg2).toBe('consent-request.toast.message.DEFAULT');
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
