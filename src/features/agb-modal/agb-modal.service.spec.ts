import { ApplicationRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { AgbService } from '@/entities/api';
import { UserInfoDto } from '@/entities/openapi';
import { AuthService } from '@/shared/lib/auth';
import {
  createMockAgbService,
  createMockAuthService,
  mockAgbRevision,
  MockAgbService,
  MockAuthService,
} from '@/shared/testing/mocks';

import { AgbModalService } from './agb-modal.service';

describe('AgbModalService', () => {
  let agbService: MockAgbService;
  let authService: MockAuthService;

  const acceptedUserInfo: UserInfoDto = {
    lastAcceptedAgbRevisionId: mockAgbRevision.id,
    lastAcceptedAgbDate: '2026-06-01T00:00:00Z',
  };

  const staleUserInfo: UserInfoDto = {
    lastAcceptedAgbRevisionId: mockAgbRevision.id,
    lastAcceptedAgbDate: '2025-01-01T00:00:00Z',
  };

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

    TestBed.configureTestingModule({
      providers: [
        AgbModalService,
        { provide: AgbService, useValue: agbService },
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

    it('stays closed on a plain refresh even for a consumer who has not accepted the AGB', async () => {
      authService.__testSignals.isAuthenticated.set(true);
      authService.__testSignals.justLoggedIn.set(false);
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
      signInAsConsumer();

      const service = await createService();
      expect(service.open()).toBe(true);

      service.dismiss();

      expect(service.open()).toBe(false);
    });
  });
});
