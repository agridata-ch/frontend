import { ApplicationRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { AgbService } from '@/entities/api';
import { AgridataStateService } from '@/entities/api/agridata-state.service';
import { UserInfoDto } from '@/entities/openapi';
import { AuthService } from '@/shared/lib/auth';
import {
  createMockAgbService,
  createMockAgridataStateService,
  createMockAuthService,
  mockAgbRevision,
  MockAgbService,
  MockAgridataStateService,
  MockAuthService,
} from '@/shared/testing/mocks';

import { AgbModalService } from './agb-modal.service';

describe('AgbModalService', () => {
  let agbService: MockAgbService;
  let authService: MockAuthService;
  let stateService: MockAgridataStateService;

  const FUTURE_ENFORCE_DATE = '2099-01-01T00:00:00Z';
  const PAST_ENFORCE_DATE = '2020-01-01T00:00:00Z';

  /** Simulate a fresh login as a consumer with the given enforcement deadline. */
  function signIn(enforceAgbAcceptanceFrom?: UserInfoDto['enforceAgbAcceptanceFrom']): void {
    authService.__testSignals.isConsumer.set(true);
    authService.__testSignals.justLoggedIn.set(true);
    authService.__testSignals.userInfo.set({ enforceAgbAcceptanceFrom });
  }

  async function createService(): Promise<AgbModalService> {
    const service = TestBed.inject(AgbModalService);
    await TestBed.inject(ApplicationRef).whenStable();
    return service;
  }

  beforeEach(() => {
    agbService = createMockAgbService();
    authService = createMockAuthService();
    stateService = createMockAgridataStateService();

    TestBed.configureTestingModule({
      providers: [
        AgbModalService,
        { provide: AgbService, useValue: agbService },
        { provide: AgridataStateService, useValue: stateService },
        { provide: AuthService, useValue: authService },
      ],
    });
  });

  describe('visibility', () => {
    it('stays closed when enforceAgbAcceptanceFrom is undefined', async () => {
      signIn(undefined);

      const service = await createService();

      expect(service.open()).toBe(false);
    });

    it('stays closed when enforceAgbAcceptanceFrom is null', async () => {
      signIn(null as unknown as undefined);

      const service = await createService();

      expect(service.open()).toBe(false);
    });

    it('stays closed when enforceAgbAcceptanceFrom is an empty string', async () => {
      signIn('');

      const service = await createService();

      expect(service.open()).toBe(false);
    });

    it('opens when enforceAgbAcceptanceFrom is in the future', async () => {
      signIn(FUTURE_ENFORCE_DATE);

      const service = await createService();

      expect(service.open()).toBe(true);
    });

    it('opens when enforceAgbAcceptanceFrom is in the past', async () => {
      signIn(PAST_ENFORCE_DATE);

      const service = await createService();

      expect(service.open()).toBe(true);
    });

    it('stays closed when the user is neither consumer nor provider', async () => {
      signIn(FUTURE_ENFORCE_DATE);
      authService.__testSignals.isConsumer.set(false);

      const service = await createService();

      expect(service.open()).toBe(false);
    });

    it('opens for a data provider even without the consumer role', async () => {
      signIn(FUTURE_ENFORCE_DATE);
      authService.__testSignals.isConsumer.set(false);
      authService.__testSignals.isDataProvider.set(true);

      const service = await createService();

      expect(service.open()).toBe(true);
    });
  });

  describe('skippability', () => {
    it('is skippable and does not block the app when the deadline is in the future', async () => {
      signIn(FUTURE_ENFORCE_DATE);

      const service = await createService();

      expect(service.isSkippable()).toBe(true);
      expect(service.isAgbConsentEnforced()).toBe(false);
    });

    it('is not skippable and blocks the app when the deadline is in the past', async () => {
      signIn(PAST_ENFORCE_DATE);

      const service = await createService();

      expect(service.isSkippable()).toBe(false);
      expect(service.isAgbConsentEnforced()).toBe(true);
    });

    it('neither shows, skips, nor blocks when there is no pending deadline', async () => {
      signIn(undefined);

      const service = await createService();

      expect(service.open()).toBe(false);
      expect(service.isSkippable()).toBe(false);
      expect(service.isAgbConsentEnforced()).toBe(false);
    });
  });

  describe('accept', () => {
    it('records acceptance, refreshes user info and closes the modal', async () => {
      signIn(FUTURE_ENFORCE_DATE);

      const service = await createService();
      expect(service.open()).toBe(true);

      await service.accept();

      expect(agbService.acceptAgbs).toHaveBeenCalledWith(mockAgbRevision.id);
      expect(authService.refreshUserInfo).toHaveBeenCalled();
      expect(service.open()).toBe(false);
    });

    it('throws and does not record acceptance when the current revision has no id', async () => {
      agbService.fetchAgbs.mockResolvedValue({ ...mockAgbRevision, id: undefined });
      signIn(FUTURE_ENFORCE_DATE);

      const service = await createService();

      await expect(service.accept()).rejects.toThrow();
      expect(agbService.acceptAgbs).not.toHaveBeenCalled();
    });
  });

  describe('dismiss', () => {
    it('closes the modal when it is skippable', async () => {
      signIn(FUTURE_ENFORCE_DATE);

      const service = await createService();
      expect(service.open()).toBe(true);

      service.dismiss();

      expect(service.open()).toBe(false);
    });
  });

  describe('app block', () => {
    it('pushes the blocking state to AgridataStateService when the deadline has passed', async () => {
      signIn(PAST_ENFORCE_DATE);

      await createService();

      expect(stateService.setAgbConsentEnforced).toHaveBeenLastCalledWith(true);
    });

    it('leaves the app unblocked when there is no pending deadline', async () => {
      signIn(undefined);

      await createService();

      expect(stateService.setAgbConsentEnforced).toHaveBeenLastCalledWith(false);
    });

    it('leaves the app unblocked when the deadline is still in the future', async () => {
      signIn(FUTURE_ENFORCE_DATE);

      await createService();

      expect(stateService.setAgbConsentEnforced).toHaveBeenLastCalledWith(false);
    });
  });
});
