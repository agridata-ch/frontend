import { ComponentRef } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContractRevisionService, DataRequestService } from '@/entities/api';
import {
  ContractRevisionDto,
  DataRequestDto,
  SignatureSlotCodeEnum,
  SignatureTypeEnum,
} from '@/entities/openapi';
import { I18nService } from '@/shared/i18n';
import { AuthService } from '@/shared/lib/auth';
import {
  createMockI18nService,
  MockI18nService,
  createMockAuthService,
  MockAuthService,
  createMockContractRevisionService,
  mockContractRevision,
  MockContractRevisionService,
  createMockDataRequestService,
} from '@/shared/testing/mocks';
import { createTranslocoTestingModule } from '@/shared/testing/transloco-testing.module';

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

  beforeEach(async () => {
    authService = createMockAuthService();
    contractRevisionService = createMockContractRevisionService();
    i18nService = createMockI18nService();

    await TestBed.configureTestingModule({
      imports: [DataRequestContractSigningComponent, createTranslocoTestingModule()],
      providers: [
        { provide: AuthService, useValue: authService },
        { provide: ContractRevisionService, useValue: contractRevisionService },
        { provide: DataRequestService, useValue: createMockDataRequestService() },
        { provide: I18nService, useValue: i18nService },
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

  describe('onSigningSuccess', () => {
    it('should update activeContractId and emit reloadDataRequest when contract has an id', () => {
      const reloadSpy = jest.fn();
      component.reloadDataRequest.subscribe(reloadSpy);

      component['onSigningSuccess'](mockContractRevision);

      expect(component['activeContractId']()).toBe(mockContractRevision.id);
      expect(reloadSpy).toHaveBeenCalled();
    });

    it('should not emit reloadDataRequest when contract has no id', () => {
      const reloadSpy = jest.fn();
      component.reloadDataRequest.subscribe(reloadSpy);

      component['onSigningSuccess']({
        ...mockContractRevision,
        id: undefined,
      } as unknown as ContractRevisionDto);

      expect(reloadSpy).not.toHaveBeenCalled();
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
