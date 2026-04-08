import { ComponentRef } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContractRevisionService } from '@/entities/api';
import { SignatureSlotCodeEnum } from '@/entities/openapi';
import { I18nService } from '@/shared/i18n';
import { AuthService } from '@/shared/lib/auth';
import { createMockI18nService, MockI18nService } from '@/shared/testing/mocks';
import { createMockAuthService, MockAuthService } from '@/shared/testing/mocks/mock-auth-service';
import {
  createMockContractRevisionService,
  mockContractRevision,
  mockOtpChallenge,
  MockContractRevisionService,
} from '@/shared/testing/mocks/mock-contract-revision-service';
import {
  createMockToastService,
  MockToastService,
} from '@/shared/testing/mocks/mock-toast-service';
import { createTranslocoTestingModule } from '@/shared/testing/transloco-testing.module';
import { ToastService, ToastType } from '@/shared/toast';

import { DataRequestContractSigningComponent } from './data-request-contract-signing.component';

describe('DataRequestContractSigningComponent', () => {
  let component: DataRequestContractSigningComponent;
  let componentRef: ComponentRef<DataRequestContractSigningComponent>;
  let fixture: ComponentFixture<DataRequestContractSigningComponent>;
  let authService: MockAuthService;
  let contractRevisionService: MockContractRevisionService;
  let i18nService: MockI18nService;
  let toastService: MockToastService;

  beforeEach(async () => {
    authService = createMockAuthService();
    contractRevisionService = createMockContractRevisionService();
    i18nService = createMockI18nService();
    toastService = createMockToastService();

    await TestBed.configureTestingModule({
      imports: [DataRequestContractSigningComponent, createTranslocoTestingModule()],
      providers: [
        { provide: AuthService, useValue: authService },
        { provide: ContractRevisionService, useValue: contractRevisionService },
        { provide: I18nService, useValue: i18nService },
        { provide: ToastService, useValue: toastService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DataRequestContractSigningComponent);
    component = fixture.componentInstance;
    componentRef = fixture.componentRef;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should not call fetchContract when contractId is not set', async () => {
    await fixture.whenStable();
    expect(contractRevisionService.fetchContract).not.toHaveBeenCalled();
  });

  it('should call fetchContract when contractId is set', async () => {
    componentRef.setInput('contractId', 'cr-1');
    fixture.detectChanges();
    await fixture.whenStable();
    expect(contractRevisionService.fetchContract).toHaveBeenCalledWith('cr-1');
  });

  describe('companyName', () => {
    it('should return consumer name when user is a consumer', async () => {
      authService.__testSignals.isConsumer.set(true);
      const consumerFixture = TestBed.createComponent(DataRequestContractSigningComponent);
      consumerFixture.componentRef.setInput('contractId', 'cr-1');
      consumerFixture.detectChanges();
      await consumerFixture.whenStable();
      expect(consumerFixture.componentInstance['companyName']()).toBe(
        mockContractRevision.dataConsumerName,
      );
    });

    it('should return provider name when user is not a consumer', async () => {
      authService.__testSignals.isConsumer.set(false);
      const providerFixture = TestBed.createComponent(DataRequestContractSigningComponent);
      providerFixture.componentRef.setInput('contractId', 'cr-1');
      providerFixture.detectChanges();
      await providerFixture.whenStable();
      expect(providerFixture.componentInstance['companyName']()).toBe(
        mockContractRevision.dataProviderName,
      );
    });
  });

  describe('slot1Signature', () => {
    it('should return DataConsumer01 signature for a consumer', async () => {
      authService.__testSignals.isConsumer.set(true);
      const consumerFixture = TestBed.createComponent(DataRequestContractSigningComponent);
      consumerFixture.componentRef.setInput('contractId', 'cr-1');
      consumerFixture.detectChanges();
      await consumerFixture.whenStable();
      expect(consumerFixture.componentInstance['slot1Signature']()?.signatureSlotCode).toBe(
        SignatureSlotCodeEnum.DataConsumer01,
      );
    });

    it('should return DataProvider01 signature for a provider', async () => {
      authService.__testSignals.isConsumer.set(false);
      authService.__testSignals.isDataProvider.set(true);
      const providerFixture = TestBed.createComponent(DataRequestContractSigningComponent);
      providerFixture.componentRef.setInput('contractId', 'cr-1');
      providerFixture.detectChanges();
      await providerFixture.whenStable();
      expect(providerFixture.componentInstance['slot1Signature']()?.signatureSlotCode).toBe(
        SignatureSlotCodeEnum.DataProvider01,
      );
    });
  });

  describe('startSigningProcess', () => {
    it('should call the service and set currentChallenge', async () => {
      componentRef.setInput('contractId', 'cr-1');
      fixture.detectChanges();
      await fixture.whenStable();

      await component.startSigningProcess(SignatureSlotCodeEnum.DataConsumer01);

      expect(contractRevisionService.startSigningProcess).toHaveBeenCalledWith(
        'cr-1',
        SignatureSlotCodeEnum.DataConsumer01,
      );
      expect(component['currentChallenge']()).toEqual({
        challenge: mockOtpChallenge,
        slotId: SignatureSlotCodeEnum.DataConsumer01,
      });
    });

    it('should reject when contractId is not set', async () => {
      await expect(
        component.startSigningProcess(SignatureSlotCodeEnum.DataConsumer01),
      ).rejects.toThrow();
    });
  });

  describe('verifySigningProcess', () => {
    it('should show a success toast and clear the challenge on success', async () => {
      componentRef.setInput('contractId', 'cr-1');
      fixture.detectChanges();
      await fixture.whenStable();
      component['currentChallenge'].set({
        challenge: mockOtpChallenge,
        slotId: SignatureSlotCodeEnum.DataConsumer01,
      });

      await component.verifySigningProcess(
        SignatureSlotCodeEnum.DataConsumer01,
        'challenge-1',
        '123456',
      );

      expect(contractRevisionService.verifySigningProcess).toHaveBeenCalledWith(
        'challenge-1',
        'cr-1',
        SignatureSlotCodeEnum.DataConsumer01,
        { otpCode: '123456' },
      );
      expect(toastService.show).toHaveBeenCalledWith(
        expect.anything(),
        expect.anything(),
        ToastType.Success,
      );
      expect(component['currentChallenge']()).toBeNull();
    });

    it('should show an error toast when verification fails', async () => {
      contractRevisionService.verifySigningProcess.mockRejectedValueOnce(new Error('failed'));
      componentRef.setInput('contractId', 'cr-1');
      fixture.detectChanges();
      await fixture.whenStable();

      await component.verifySigningProcess(
        SignatureSlotCodeEnum.DataConsumer01,
        'challenge-1',
        '000000',
      );

      expect(toastService.show).toHaveBeenCalledWith(
        expect.anything(),
        expect.anything(),
        ToastType.Error,
      );
    });

    it('should reject when contractId is not set', async () => {
      await expect(
        component.verifySigningProcess(SignatureSlotCodeEnum.DataConsumer01, 'ch-1', '123456'),
      ).rejects.toThrow();
    });
  });
});
