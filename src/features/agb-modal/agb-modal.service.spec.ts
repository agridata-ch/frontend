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

  const acceptedUserInfo: UserInfoDto = {
    lastAcceptedAgbRevisionId: mockAgbRevision.id,
    lastAcceptedAgbDate: '2026-06-01T00:00:00Z',
  };

  const staleUserInfo: UserInfoDto = {
    lastAcceptedAgbRevisionId: mockAgbRevision.id,
    lastAcceptedAgbDate: '2025-01-01T00:00:00Z',
  };

  /** A returning user who accepted an older revision but not the current one. */
  const previousRevisionUserInfo: UserInfoDto = {
    lastAcceptedAgbRevisionId: 'some-old-id',
    lastAcceptedAgbDate: '2026-06-01T00:00:00Z',
  };

  const FUTURE_ENFORCE_DATE = '2099-01-01T00:00:00Z';
  const PAST_ENFORCE_DATE = '2020-01-01T00:00:00Z';

  /** Simulate a fresh login as a consumer who has not accepted the current AGB. */
  function signInAsConsumer(): void {
    authService.__testSignals.isAuthenticated.set(true);
    authService.__testSignals.justLoggedIn.set(true);
    authService.__testSignals.isConsumer.set(true);
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
    it('stays closed when the user is not authenticated', async () => {
      authService.__testSignals.isAuthenticated.set(false);
      authService.__testSignals.justLoggedIn.set(true);
      authService.__testSignals.isConsumer.set(true);

      const service = await createService();

      expect(service.open()).toBe(false);
    });

    it('stays closed for roles other than consumer or provider', async () => {
      authService.__testSignals.isAuthenticated.set(true);
      authService.__testSignals.justLoggedIn.set(true);
      authService.__testSignals.isProducer.set(true);

      const service = await createService();

      expect(service.open()).toBe(false);
    });

    it('opens for a freshly logged-in consumer who has not accepted the current AGB', async () => {
      signInAsConsumer();

      const service = await createService();

      expect(service.open()).toBe(true);
    });

    it('stays closed when the accepted revision and date match the current AGB', async () => {
      signInAsConsumer();
      authService.__testSignals.userInfo.set(acceptedUserInfo);

      const service = await createService();

      expect(service.open()).toBe(false);
    });

    it('opens when the accepted revision matches but the accepted date predates validFrom', async () => {
      signInAsConsumer();
      authService.__testSignals.userInfo.set(staleUserInfo);

      const service = await createService();

      expect(service.open()).toBe(true);
    });

    it('opens when the accepted revision differs from the current AGB', async () => {
      signInAsConsumer();
      authService.__testSignals.userInfo.set({
        lastAcceptedAgbRevisionId: 'some-old-id',
        lastAcceptedAgbDate: '2026-06-01T00:00:00Z',
      });

      const service = await createService();

      expect(service.open()).toBe(true);
    });
  });

  describe('accept', () => {
    it('records acceptance, refreshes user info and closes the modal', async () => {
      signInAsConsumer();

      const service = await createService();
      expect(service.open()).toBe(true);

      await service.accept();

      expect(agbService.acceptAgbs).toHaveBeenCalledWith(mockAgbRevision.id);
      expect(authService.refreshUserInfo).toHaveBeenCalled();
      expect(service.open()).toBe(false);
    });

    it('throws and does not record acceptance when the current revision has no id', async () => {
      agbService.fetchAgbs.mockResolvedValue({ ...mockAgbRevision, id: undefined });
      signInAsConsumer();

      const service = await createService();

      await expect(service.accept()).rejects.toThrow();
      expect(agbService.acceptAgbs).not.toHaveBeenCalled();
    });
  });

  describe('dismiss', () => {
    it('closes the modal when it is dismissible', async () => {
      agbService.fetchAgbs.mockResolvedValue({
        ...mockAgbRevision,
        enforceConsentFrom: FUTURE_ENFORCE_DATE,
      });
      signInAsConsumer();
      authService.__testSignals.userInfo.set(previousRevisionUserInfo);

      const service = await createService();
      expect(service.open()).toBe(true);
      expect(service.isSkippable()).toBe(true);

      service.dismiss();

      expect(service.open()).toBe(false);
    });
  });

  describe('skippability', () => {
    it('is skippable when a returning user has a newer revision and the deadline is in the future', async () => {
      agbService.fetchAgbs.mockResolvedValue({
        ...mockAgbRevision,
        enforceConsentFrom: FUTURE_ENFORCE_DATE,
      });
      signInAsConsumer();
      authService.__testSignals.userInfo.set(previousRevisionUserInfo);

      const service = await createService();

      expect(service.open()).toBe(true);
      expect(service.isSkippable()).toBe(true);
      expect(service.isAgbConsentEnforced()).toBe(false);
    });

    it('is not skippable and blocks when the enforce deadline has passed', async () => {
      agbService.fetchAgbs.mockResolvedValue({
        ...mockAgbRevision,
        enforceConsentFrom: PAST_ENFORCE_DATE,
      });
      signInAsConsumer();
      authService.__testSignals.userInfo.set(previousRevisionUserInfo);

      const service = await createService();

      expect(service.open()).toBe(true);
      expect(service.isSkippable()).toBe(false);
      expect(service.isAgbConsentEnforced()).toBe(true);
    });

    it('is not skippable and blocks when the user has never accepted any AGB', async () => {
      agbService.fetchAgbs.mockResolvedValue({
        ...mockAgbRevision,
        enforceConsentFrom: FUTURE_ENFORCE_DATE,
      });
      signInAsConsumer();

      const service = await createService();

      expect(service.open()).toBe(true);
      expect(service.isSkippable()).toBe(false);
      expect(service.isAgbConsentEnforced()).toBe(true);
    });

    it('neither shows, skips, nor blocks when the current revision is already accepted', async () => {
      signInAsConsumer();
      authService.__testSignals.userInfo.set(acceptedUserInfo);

      const service = await createService();

      expect(service.open()).toBe(false);
      expect(service.isSkippable()).toBe(false);
      expect(service.isAgbConsentEnforced()).toBe(false);
    });
  });

  describe('app block', () => {
    it('pushes the blocking state to AgridataStateService when consent is enforced', async () => {
      agbService.fetchAgbs.mockResolvedValue({
        ...mockAgbRevision,
        enforceConsentFrom: PAST_ENFORCE_DATE,
      });
      signInAsConsumer();

      await createService();

      expect(stateService.setAgbConsentEnforced).toHaveBeenCalledWith(true);
    });

    it('leaves the app unblocked once the accepted current revision has resolved', async () => {
      signInAsConsumer();
      authService.__testSignals.userInfo.set(acceptedUserInfo);

      await createService();

      // May block transiently while the revision is still loading, but the settled state is unblocked.
      expect(stateService.setAgbConsentEnforced).toHaveBeenLastCalledWith(false);
    });

    it('blocks the app while the AGB revision is still loading for an eligible user', () => {
      signInAsConsumer();
      // A fetch that never settles keeps the resource in its loading state.
      agbService.fetchAgbs.mockReturnValue(new Promise<never>(() => {}));

      const service = TestBed.inject(AgbModalService);
      TestBed.inject(ApplicationRef).tick();

      expect(service.isAgbConsentEnforced()).toBe(true);
    });
  });
});
