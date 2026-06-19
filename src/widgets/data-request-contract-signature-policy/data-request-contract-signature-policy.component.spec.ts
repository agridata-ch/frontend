import { ComponentRef } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DataRequestService } from '@/entities/api';
import { AgridataStateService } from '@/entities/api/agridata-state.service';
import { ContractRevisionDto, DataRequestDto, SignatureTypeEnum } from '@/entities/openapi';
import { I18nService } from '@/shared/i18n';
import { AuthService } from '@/shared/lib/auth';
import {
  createMockAgridataStateService,
  createMockAuthService,
  MockAuthService,
  createMockDataRequestService,
  MockDataRequestService,
  createMockI18nService,
} from '@/shared/testing/mocks';
import { createTranslocoTestingModule } from '@/shared/testing/transloco-testing.module';

import { DataRequestContractSignaturePolicyComponent } from './data-request-contract-signature-policy.component';

const mockContract: ContractRevisionDto = {
  id: 'cr-1',
  dataRequestId: 'dr-1',
  dataConsumerName: 'Consumer Corp',
  dataProviderName: 'Provider AG',
  dataRequestContext: {},
  dataConsumerCity: '',
  dataProviderCity: '',
};

const mockDataRequest: DataRequestDto = {
  id: 'dr-1',
  stateCode: '',
  advantages: [],
};

describe('DataRequestContractSignaturePolicyComponent', () => {
  let component: DataRequestContractSignaturePolicyComponent;
  let fixture: ComponentFixture<DataRequestContractSignaturePolicyComponent>;
  let componentRef: ComponentRef<DataRequestContractSignaturePolicyComponent>;
  let authService: MockAuthService;
  let dataRequestService: MockDataRequestService;

  beforeEach(async () => {
    authService = createMockAuthService();
    dataRequestService = createMockDataRequestService();

    await TestBed.configureTestingModule({
      imports: [DataRequestContractSignaturePolicyComponent, createTranslocoTestingModule()],
      providers: [
        { provide: AgridataStateService, useValue: createMockAgridataStateService() },
        { provide: AuthService, useValue: authService },
        { provide: DataRequestService, useValue: dataRequestService },
        { provide: I18nService, useValue: createMockI18nService() },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DataRequestContractSignaturePolicyComponent);
    component = fixture.componentInstance;
    componentRef = fixture.componentRef;
    componentRef.setInput('dataRequest', mockDataRequest);
    componentRef.setInput('contract', mockContract);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('companyName', () => {
    it('should return dataConsumerName when user is a consumer', () => {
      authService.__testSignals.isConsumer.set(true);
      const consumerFixture = TestBed.createComponent(DataRequestContractSignaturePolicyComponent);
      consumerFixture.componentRef.setInput('dataRequest', mockDataRequest);
      consumerFixture.componentRef.setInput('contract', mockContract);
      consumerFixture.detectChanges();

      expect(consumerFixture.componentInstance['companyName']()).toBe('Consumer Corp');
    });

    it('should return dataProviderName when user is not a consumer', () => {
      expect(component['companyName']()).toBe('Provider AG');
    });
  });

  describe('selectedPolicy', () => {
    it('should return consumerSignatureType for a consumer', () => {
      authService.__testSignals.isConsumer.set(true);
      const consumerFixture = TestBed.createComponent(DataRequestContractSignaturePolicyComponent);
      consumerFixture.componentRef.setInput('dataRequest', {
        ...mockDataRequest,
        consumerSignatureType: SignatureTypeEnum.IndividualSignature,
      });
      consumerFixture.componentRef.setInput('contract', mockContract);
      consumerFixture.detectChanges();

      expect(consumerFixture.componentInstance['selectedPolicy']()).toBe(
        SignatureTypeEnum.IndividualSignature,
      );
    });

    it('should default to CollectiveSignature for a consumer when type is not set', () => {
      authService.__testSignals.isConsumer.set(true);
      const consumerFixture = TestBed.createComponent(DataRequestContractSignaturePolicyComponent);
      consumerFixture.componentRef.setInput('dataRequest', mockDataRequest);
      consumerFixture.componentRef.setInput('contract', mockContract);
      consumerFixture.detectChanges();

      expect(consumerFixture.componentInstance['selectedPolicy']()).toBe(
        SignatureTypeEnum.CollectiveSignature,
      );
    });

    it('should return providerSignatureType for a provider', () => {
      componentRef.setInput('dataRequest', {
        ...mockDataRequest,
        providerSignatureType: SignatureTypeEnum.IndividualSignature,
      });
      fixture.detectChanges();

      expect(component['selectedPolicy']()).toBe(SignatureTypeEnum.IndividualSignature);
    });

    it('should default to CollectiveSignature for a provider when type is not set', () => {
      expect(component['selectedPolicy']()).toBe(SignatureTypeEnum.CollectiveSignature);
    });
  });

  describe('handlePolicyChange', () => {
    it('should call setSignatureType and emit reload for a valid value', async () => {
      const emitSpy = jest.spyOn(component.handleReloadDataRequest, 'emit');

      component['handlePolicyChange'](SignatureTypeEnum.IndividualSignature);
      await fixture.whenStable();

      expect(dataRequestService.setSignatureType).toHaveBeenCalledWith(
        'dr-1',
        SignatureTypeEnum.IndividualSignature,
        undefined,
      );
      expect(emitSpy).toHaveBeenCalled();
    });

    it('should not call service when component is disabled', async () => {
      componentRef.setInput('disabled', true);
      fixture.detectChanges();

      component['handlePolicyChange'](SignatureTypeEnum.IndividualSignature);
      await fixture.whenStable();

      expect(dataRequestService.setSignatureType).not.toHaveBeenCalled();
    });

    it('should not call service for an unrecognized value', async () => {
      component['handlePolicyChange']('UNKNOWN_TYPE');
      await fixture.whenStable();

      expect(dataRequestService.setSignatureType).not.toHaveBeenCalled();
    });

    it('should not call service for undefined', async () => {
      component['handlePolicyChange'](undefined);
      await fixture.whenStable();

      expect(dataRequestService.setSignatureType).not.toHaveBeenCalled();
    });
  });
});
