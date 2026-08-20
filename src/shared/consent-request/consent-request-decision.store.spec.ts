import { ConsentRequestProducerViewV2Dto, ConsentRequestStateEnum } from '@/entities/openapi';

import { ConsentRequestDecisionStore } from './consent-request-decision.store';

describe('ConsentRequestDecisionStore', () => {
  let store: ConsentRequestDecisionStore;

  const requests: ConsentRequestProducerViewV2Dto[] = [
    { id: 'uid-1', dataProducerUid: 'uid-1', stateCode: ConsentRequestStateEnum.Opened },
    { id: 'bur-granted', dataProducerBur: '111', stateCode: ConsentRequestStateEnum.Granted },
    { id: 'bur-open', dataProducerBur: '222', stateCode: ConsentRequestStateEnum.Opened },
  ];

  beforeEach(() => {
    store = new ConsentRequestDecisionStore();
    store.consentRequests.set(requests);
  });

  describe('grouping', () => {
    it('splits children into a BUR group and a single UID request by dataProducerBur', () => {
      expect(store.burRequests().map((request) => request.id)).toEqual(['bur-granted', 'bur-open']);
      expect(store.uidRequest()?.id).toBe('uid-1');
    });

    it('takes the first UID request when malformed data carries more than one', () => {
      store.consentRequests.set([
        { id: 'uid-1', dataProducerUid: 'a', stateCode: ConsentRequestStateEnum.Opened },
        { id: 'uid-2', dataProducerUid: 'b', stateCode: ConsentRequestStateEnum.Opened },
      ]);

      expect(store.uidRequest()?.id).toBe('uid-1');
    });
  });

  describe('startEdit', () => {
    it('seeds GRANTED and OPENED toggles on, DECLINED off, and enables edit mode', () => {
      store.consentRequests.set([
        { id: 'granted', dataProducerBur: '1', stateCode: ConsentRequestStateEnum.Granted },
        { id: 'open', dataProducerBur: '2', stateCode: ConsentRequestStateEnum.Opened },
        { id: 'declined', dataProducerBur: '3', stateCode: ConsentRequestStateEnum.Declined },
      ]);

      store.startEdit();

      expect(store.editMode()).toBe(true);
      expect(store.decisions()).toEqual({ granted: true, open: true, declined: false });
    });
  });

  describe('setDecision', () => {
    it('updates a single BUR decision without touching the others', () => {
      store.startEdit();
      store.setDecision('bur-open', false);

      expect(store.decisions()).toEqual({ 'bur-granted': true, 'bur-open': false });
    });

    it('allows turning off every BUR, leaving grantedCount at 0 for the save guard', () => {
      store.startEdit();
      store.setDecision('bur-open', false);
      store.setDecision('bur-granted', false);

      expect(store.decisions()['bur-granted']).toBe(false);
      expect(store.grantedCount()).toBe(0);
    });
  });

  describe('cancelEdit', () => {
    it('clears staged decisions and leaves edit mode', () => {
      store.startEdit();
      store.setDecision('bur-open', true);

      store.cancelEdit();

      expect(store.editMode()).toBe(false);
      expect(store.decisions()).toEqual({});
    });
  });
});
