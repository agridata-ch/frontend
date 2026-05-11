import { ComponentRef } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContractRevisionService, DataRequestService } from '@/entities/api';
import { DataRequestDto, SignatureSlotCodeEnum, SignatureTypeEnum } from '@/entities/openapi';
import { I18nService } from '@/shared/i18n';
import { AuthService } from '@/shared/lib/auth';
import {
  createMockI18nService,
  MockI18nService,
  createMockAuthService,
  MockAuthService,
  createMockContractRevisionService,
  mockContractRevision,
  mockOtpChallenge,
  MockContractRevisionService,
  createMockDataRequestService,
  createMockToastService,
  MockToastService,
} from '@/shared/testing/mocks';
import { createTranslocoTestingModule } from '@/shared/testing/transloco-testing.module';
import { ToastService, ToastType } from '@/shared/toast';

import { DataRequestContractSigningComponent } from './data-request-contract-signing.component';

const mockDataRequest: DataRequestDto = { id: 'dr-1', stateCode: 'draft' };
const mockDataRequestWithContract: DataRequestDto = {
  id: 'dr-1',
  stateCode: 'draft',
  currentContractRevisionId: 'cr-1',
};

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
        { provide: DataRequestService, useValue: createMockDataRequestService() },
        { provide: I18nService, useValue: i18nService },
        { provide: ToastService, useValue: toastService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DataRequestContractSigningComponent);
    component = fixture.componentInstance;
    componentRef = fixture.componentRef;
    componentRef.setInput('dataRequest', mockDataRequest);
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
    componentRef.setInput('dataRequest', mockDataRequestWithContract);
    fixture.detectChanges();
    await fixture.whenStable();
    expect(contractRevisionService.fetchContract).toHaveBeenCalledWith('cr-1');
  });

  describe('companyName', () => {
    it('should return consumer name when user is a consumer', async () => {
      authService.__testSignals.isConsumer.set(true);
      const consumerFixture = TestBed.createComponent(DataRequestContractSigningComponent);
      consumerFixture.componentRef.setInput('dataRequest', mockDataRequestWithContract);
      consumerFixture.detectChanges();
      await consumerFixture.whenStable();
      expect(consumerFixture.componentInstance['companyName']()).toBe(
        mockContractRevision.dataConsumerName,
      );
    });

    it('should return provider name when user is not a consumer', async () => {
      authService.__testSignals.isConsumer.set(false);
      const providerFixture = TestBed.createComponent(DataRequestContractSigningComponent);
      providerFixture.componentRef.setInput('dataRequest', mockDataRequestWithContract);
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
      consumerFixture.componentRef.setInput('dataRequest', mockDataRequestWithContract);
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
      providerFixture.componentRef.setInput('dataRequest', mockDataRequestWithContract);
      providerFixture.detectChanges();
      await providerFixture.whenStable();
      expect(providerFixture.componentInstance['slot1Signature']()?.signatureSlotCode).toBe(
        SignatureSlotCodeEnum.DataProvider01,
      );
    });
  });

  describe('startSigningProcess', () => {
    it('should call the service and set currentChallenge', async () => {
      componentRef.setInput('dataRequest', mockDataRequestWithContract);
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
      componentRef.setInput('dataRequest', mockDataRequestWithContract);
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
      componentRef.setInput('dataRequest', mockDataRequestWithContract);
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

  describe('isCollectiveSignatureType', () => {
    it('should return true for a consumer with CollectiveSignature', () => {
      authService.__testSignals.isConsumer.set(true);
      const f = TestBed.createComponent(DataRequestContractSigningComponent);
      f.componentRef.setInput('dataRequest', {
        ...mockDataRequest,
        consumerSignatureType: SignatureTypeEnum.CollectiveSignature,
      });
      f.detectChanges();
      expect(f.componentInstance['isCollectiveSignatureType']()).toBe(true);
    });

    it('should return false for a consumer with IndividualSignature', () => {
      authService.__testSignals.isConsumer.set(true);
      const f = TestBed.createComponent(DataRequestContractSigningComponent);
      f.componentRef.setInput('dataRequest', {
        ...mockDataRequest,
        consumerSignatureType: SignatureTypeEnum.IndividualSignature,
      });
      f.detectChanges();
      expect(f.componentInstance['isCollectiveSignatureType']()).toBe(false);
    });

    it('should default to true for a consumer when type is not set', () => {
      authService.__testSignals.isConsumer.set(true);
      const f = TestBed.createComponent(DataRequestContractSigningComponent);
      f.componentRef.setInput('dataRequest', mockDataRequest);
      f.detectChanges();
      expect(f.componentInstance['isCollectiveSignatureType']()).toBe(true);
    });

    it('should return true for a provider with CollectiveSignature', () => {
      authService.__testSignals.isDataProvider.set(true);
      const f = TestBed.createComponent(DataRequestContractSigningComponent);
      f.componentRef.setInput('dataRequest', {
        ...mockDataRequest,
        providerSignatureType: SignatureTypeEnum.CollectiveSignature,
      });
      f.detectChanges();
      expect(f.componentInstance['isCollectiveSignatureType']()).toBe(true);
    });

    it('should return false for a provider with IndividualSignature', () => {
      authService.__testSignals.isDataProvider.set(true);
      const f = TestBed.createComponent(DataRequestContractSigningComponent);
      f.componentRef.setInput('dataRequest', {
        ...mockDataRequest,
        providerSignatureType: SignatureTypeEnum.IndividualSignature,
      });
      f.detectChanges();
      expect(f.componentInstance['isCollectiveSignatureType']()).toBe(false);
    });

    it('should default to true for a provider when type is not set', () => {
      authService.__testSignals.isDataProvider.set(true);
      const f = TestBed.createComponent(DataRequestContractSigningComponent);
      f.componentRef.setInput('dataRequest', mockDataRequest);
      f.detectChanges();
      expect(f.componentInstance['isCollectiveSignatureType']()).toBe(true);
    });
  });
});
