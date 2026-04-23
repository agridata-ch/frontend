import { ComponentRef } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';

import { ErrorHandlerService } from '@/app/error/error-handler.service';
import { ContractRevisionService, DataRequestService, UidRegisterService } from '@/entities/api';
import { MasterDataService } from '@/entities/api/master-data.service';
import { DataRequestDto, DataRequestStateEnum } from '@/entities/openapi';
import { I18nService } from '@/shared/i18n';
import { AuthService } from '@/shared/lib/auth';
import { SidepanelComponent } from '@/shared/sidepanel';
import { createMockAuthService, MockAuthService } from '@/shared/testing/mocks/mock-auth-service';
import {
  createMockContractRevisionService,
  MockContractRevisionService,
} from '@/shared/testing/mocks/mock-contract-revision-service';
import {
  createMockDataRequestService,
  MockDataRequestService,
} from '@/shared/testing/mocks/mock-data-request-service';
import {
  createMockErrorHandlerService,
  MockErrorHandlerService,
} from '@/shared/testing/mocks/mock-error-handler.service';
import { createMockI18nService } from '@/shared/testing/mocks/mock-i18n-service';
import {
  createMockMasterDataService,
  MockMasterDataService,
} from '@/shared/testing/mocks/mock-master-data-service';
import { AgridataWizardComponent } from '@/widgets/agridata-wizard';

import { DataRequestDetailsRequestComponent } from './data-request-details-request';
import { DataRequestDetailsComponent } from './data-request-details.component';
import { DETAILS_TABS_ID } from './data-request-details.model';

describe('DataRequestDetailsComponent', () => {
  let fixture: ComponentFixture<DataRequestDetailsComponent>;
  let component: DataRequestDetailsComponent;
  let componentRef: ComponentRef<DataRequestDetailsComponent>;
  let authService: MockAuthService;
  let contractRevisionService: MockContractRevisionService;
  let dataRequestService: MockDataRequestService;
  let errorService: MockErrorHandlerService;
  let masterDataService: MockMasterDataService;

  beforeEach(async () => {
    contractRevisionService = createMockContractRevisionService();
    dataRequestService = createMockDataRequestService();
    errorService = createMockErrorHandlerService();
    masterDataService = createMockMasterDataService();

    // Create factory mock and provide it so tests can mutate signals directly
    authService = createMockAuthService();

    await TestBed.configureTestingModule({
      imports: [DataRequestDetailsComponent, ReactiveFormsModule, AgridataWizardComponent],
      providers: [
        { provide: ContractRevisionService, useValue: contractRevisionService },
        { provide: DataRequestService, useValue: dataRequestService },
        { provide: I18nService, useValue: createMockI18nService() },
        { provide: AuthService, useValue: authService },
        { provide: UidRegisterService, useValue: createMockI18nService() },
        { provide: ErrorHandlerService, useValue: errorService },
        { provide: MasterDataService, useValue: masterDataService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DataRequestDetailsComponent);
    component = fixture.componentInstance;
    componentRef = fixture.componentRef;

    // Set up mock behavior
    authService.getUserFullName.mockReturnValue('Test User');

    // Set required input before detectChanges
    componentRef.setInput('dataRequestId', 'test-id');

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('updateDataRequestFromRessourceEffect', () => {
    it('should update dataRequest when request loaded', async () => {
      const newRequest: DataRequestDto = {
        id: 'test-id',
        dataProviderId: 'test-provider',
        stateCode: DataRequestStateEnum.Draft,
        dataConsumerDisplayName: 'Test Consumer',
        dataConsumerCity: 'Test City',
        contactPhoneNumber: '1234567890',
        contactEmailAddress: 'test@example.com',
        products: ['product1'],
      };

      dataRequestService.fetchDataRequest.mockResolvedValue(newRequest);

      const newFixture = TestBed.createComponent(DataRequestDetailsComponent);
      const newComponentRef = newFixture.componentRef;
      newComponentRef.setInput('dataRequestId', 'test-id');
      newFixture.detectChanges();
      await newFixture.whenStable();

      expect(newFixture.componentInstance['dataRequest']()).toEqual(newRequest);
    });

    it('should return null when resource is loading', async () => {
      // The resource starts loading immediately, but may resolve quickly
      // We need to check before it finishes loading
      const slowRequest: DataRequestDto = {
        id: 'test-id',
        dataProviderId: 'test-provider',
        stateCode: DataRequestStateEnum.Draft,
      };

      let resolveRequest: (value: DataRequestDto) => void;
      const slowPromise = new Promise<DataRequestDto>((resolve) => {
        resolveRequest = resolve;
      });

      dataRequestService.fetchDataRequest.mockReturnValue(slowPromise);

      const slowFixture = TestBed.createComponent(DataRequestDetailsComponent);
      const slowComponentRef = slowFixture.componentRef;
      slowComponentRef.setInput('dataRequestId', 'slow-test-id');
      slowFixture.detectChanges();

      // At this point, resource should be loading
      expect(slowFixture.componentInstance['dataRequestResource'].isLoading()).toBe(true);
      expect(slowFixture.componentInstance['dataRequest']()).toBeNull();

      // Resolve the promise
      resolveRequest!(slowRequest);
      await slowFixture.whenStable();
    });

    it('should open panel once data is loaded', async () => {
      const newRequest: DataRequestDto = {
        id: 'test-id',
        dataProviderId: 'test-provider',
        stateCode: DataRequestStateEnum.Draft,
        dataConsumerDisplayName: 'Test Consumer',
      };

      dataRequestService.fetchDataRequest.mockResolvedValue(newRequest);

      const newFixture = TestBed.createComponent(DataRequestDetailsComponent);
      const newComponentRef = newFixture.componentRef;
      newComponentRef.setInput('dataRequestId', 'test-id');
      newFixture.detectChanges();
      await newFixture.whenStable();

      const sidePanelComp = newFixture.debugElement.query(By.directive(SidepanelComponent));
      expect(sidePanelComp).toBeTruthy();
      expect(sidePanelComp.componentInstance.isOpen()).toBe(true);
    });

    it('should handle errors from dataRequestsResource and send them to errorService', async () => {
      const testError = new Error('Test error from fetchDataRequests');
      dataRequestService.fetchDataRequest.mockRejectedValueOnce(testError);

      const errorFixture = TestBed.createComponent(DataRequestDetailsComponent);
      const errorComponentRef = errorFixture.componentRef;
      errorComponentRef.setInput('dataRequestId', 'error-test-id');

      try {
        errorFixture.detectChanges();
        await errorFixture.whenStable();
      } catch {
        // Expected error during resource loading
      }

      expect(errorService.handleError).toHaveBeenCalledWith(testError);
    });
  });

  describe('handleSidepanelClose', () => {
    it('should emit closeSidepanel output', () => {
      const emitSpy = jest.spyOn(component.closeSidepanel, 'emit');

      component['handleSidepanelClose']();

      expect(emitSpy).toHaveBeenCalled();
    });

    it('should be called when sidepanel emits closeSidepanel', async () => {
      const newRequest: DataRequestDto = {
        id: 'test-id',
        dataProviderId: 'test-provider',
        stateCode: DataRequestStateEnum.Draft,
      };

      dataRequestService.fetchDataRequest.mockResolvedValue(newRequest);

      const newFixture = TestBed.createComponent(DataRequestDetailsComponent);
      const newComponentRef = newFixture.componentRef;
      newComponentRef.setInput('dataRequestId', 'test-id');
      newFixture.detectChanges();
      await newFixture.whenStable();

      const emitSpy = jest.spyOn(newFixture.componentInstance.closeSidepanel, 'emit');
      const sidepanel = newFixture.debugElement.query(By.directive(SidepanelComponent));

      sidepanel.componentInstance.closeSidepanel.emit();

      expect(emitSpy).toHaveBeenCalled();
    });
  });

  describe('RedirectUrlRegexEditable', () => {
    it('should pass isRedirectUriRegexEditable to the request details component', async () => {
      const newRequest: DataRequestDto = {
        id: 'test-id',
        dataProviderId: 'test-provider',
        stateCode: DataRequestStateEnum.Draft,
      };

      dataRequestService.fetchDataRequest.mockResolvedValue(newRequest);

      const newFixture = TestBed.createComponent(DataRequestDetailsComponent);
      const newComponentRef = newFixture.componentRef;
      newComponentRef.setInput('dataRequestId', 'test-id');
      newComponentRef.setInput('isRedirectUriRegexEditable', true);
      newFixture.detectChanges();
      await newFixture.whenStable();

      const requestDetailsComp = newFixture.debugElement.query(
        By.directive(DataRequestDetailsRequestComponent),
      );
      expect(requestDetailsComp).toBeTruthy();
      expect(requestDetailsComp.componentInstance.isRedirectUriRegexEditable()).toBe(true);
    });
  });

  describe('contract loading', () => {
    it('should not fetch contract while contract tab is not active', async () => {
      const requestWithContract: DataRequestDto = {
        id: 'test-id',
        currentContractRevisionId: 'contract-revision-id',
        dataProviderId: 'test-provider',
        stateCode: DataRequestStateEnum.ToBeSignedByProvider,
      };
      dataRequestService.fetchDataRequest.mockResolvedValue(requestWithContract);

      const newFixture = TestBed.createComponent(DataRequestDetailsComponent);
      const newComponentRef = newFixture.componentRef;
      newComponentRef.setInput('dataRequestId', 'test-id');
      newFixture.detectChanges();
      await newFixture.whenStable();

      expect(contractRevisionService.fetchContract).not.toHaveBeenCalled();
    });

    it('should fetch contract when contract tab becomes active', async () => {
      const requestWithContract: DataRequestDto = {
        id: 'test-id',
        currentContractRevisionId: 'contract-revision-id',
        dataProviderId: 'test-provider',
        stateCode: DataRequestStateEnum.ToBeSignedByProvider,
      };
      dataRequestService.fetchDataRequest.mockResolvedValue(requestWithContract);

      const newFixture = TestBed.createComponent(DataRequestDetailsComponent);
      const newComponentRef = newFixture.componentRef;
      newComponentRef.setInput('dataRequestId', 'test-id');
      newFixture.detectChanges();
      await newFixture.whenStable();

      newFixture.componentInstance['activeTabId'].set(DETAILS_TABS_ID.CONTRACT);
      newFixture.detectChanges();
      await newFixture.whenStable();

      expect(contractRevisionService.fetchContract).toHaveBeenCalledWith('contract-revision-id');
    });

    it('should refetch contract when opening contract tab repeatedly', async () => {
      const requestWithContract: DataRequestDto = {
        id: 'test-id',
        currentContractRevisionId: 'contract-revision-id',
        dataProviderId: 'test-provider',
        stateCode: DataRequestStateEnum.ToBeSignedByProvider,
      };
      dataRequestService.fetchDataRequest.mockResolvedValue(requestWithContract);

      const newFixture = TestBed.createComponent(DataRequestDetailsComponent);
      const newComponentRef = newFixture.componentRef;
      newComponentRef.setInput('dataRequestId', 'test-id');
      newFixture.detectChanges();
      await newFixture.whenStable();

      newFixture.componentInstance['activeTabId'].set(DETAILS_TABS_ID.CONTRACT);
      newFixture.detectChanges();
      await newFixture.whenStable();

      newFixture.componentInstance['activeTabId'].set(DETAILS_TABS_ID.REQUEST);
      newFixture.detectChanges();
      await newFixture.whenStable();

      newFixture.componentInstance['activeTabId'].set(DETAILS_TABS_ID.CONTRACT);
      newFixture.detectChanges();
      await newFixture.whenStable();

      expect(contractRevisionService.fetchContract).toHaveBeenCalledTimes(2);
    });
  });
});
