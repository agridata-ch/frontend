import { ComponentRef } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { Router, provideRouter, withComponentInputBinding } from '@angular/router';

import { ErrorHandlerService } from '@/app/error/error-handler.service';
import { DataRequestService, UidRegisterService } from '@/entities/api';
import { MasterDataService } from '@/entities/api/master-data.service';
import { DataProductDto, DataRequestDto } from '@/entities/openapi';
import { ConsentRequestDetailViewDtoDataRequestStateCode } from '@/entities/openapi/model/consentRequestDetailViewDtoDataRequestStateCode';
import { FORCE_RELOAD_DATA_REQUESTS_STATE_PARAM } from '@/pages/admin-page';
import { ROUTE_PATHS } from '@/shared/constants/constants';
import { I18nService } from '@/shared/i18n';
import { AuthService } from '@/shared/lib/auth';
import { SidepanelComponent } from '@/shared/sidepanel';
import { createMockAuthService, MockAuthService } from '@/shared/testing/mocks/mock-auth-service';
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

import { DataRequestDetailsComponent } from './data-request-details.component';

describe('DataRequestDetailsComponent', () => {
  let fixture: ComponentFixture<DataRequestDetailsComponent>;
  let component: DataRequestDetailsComponent;
  let componentRef: ComponentRef<DataRequestDetailsComponent>;
  let authService: MockAuthService;
  let dataRequestService: MockDataRequestService;
  let errorService: MockErrorHandlerService;
  let masterDataService: MockMasterDataService;

  beforeEach(async () => {
    dataRequestService = createMockDataRequestService();
    errorService = createMockErrorHandlerService();
    masterDataService = createMockMasterDataService();

    // Create factory mock and provide it so tests can mutate signals directly
    authService = createMockAuthService();

    await TestBed.configureTestingModule({
      imports: [DataRequestDetailsComponent, ReactiveFormsModule, AgridataWizardComponent],
      providers: [
        { provide: DataRequestService, useValue: dataRequestService },
        { provide: I18nService, useValue: createMockI18nService() },
        { provide: AuthService, useValue: authService },
        { provide: UidRegisterService, useValue: createMockI18nService() },
        { provide: ErrorHandlerService, useValue: errorService },
        { provide: MasterDataService, useValue: masterDataService },
        provideRouter(
          [
            {
              path: `${ROUTE_PATHS.DATA_REQUESTS_CONSUMER_PATH}/:dataRequestId`,
              component: DataRequestDetailsComponent,
            },
            {
              path: ROUTE_PATHS.ADMIN_PATH,
              component: DataRequestDetailsComponent,
            },
          ],
          withComponentInputBinding(),
        ),
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
        stateCode: ConsentRequestDetailViewDtoDataRequestStateCode.Draft,
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
        stateCode: ConsentRequestDetailViewDtoDataRequestStateCode.Draft,
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
        stateCode: ConsentRequestDetailViewDtoDataRequestStateCode.Draft,
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

  describe('computed signals', () => {
    it('should compute formattedSubmissionDate correctly', async () => {
      const newRequest: DataRequestDto = {
        id: 'test-id',
        submissionDate: '2026-01-09T10:00:00Z',
        stateCode: ConsentRequestDetailViewDtoDataRequestStateCode.Draft,
      };

      dataRequestService.fetchDataRequest.mockResolvedValue(newRequest);

      const newFixture = TestBed.createComponent(DataRequestDetailsComponent);
      const newComponentRef = newFixture.componentRef;
      newComponentRef.setInput('dataRequestId', 'test-id');
      newFixture.detectChanges();
      await newFixture.whenStable();

      expect(newFixture.componentInstance['formattedSubmissionDate']()).toBeDefined();
    });

    it('should compute productsList correctly', async () => {
      const newRequest: DataRequestDto = {
        id: 'test-id',
        products: ['product1', 'product2'],
        stateCode: ConsentRequestDetailViewDtoDataRequestStateCode.Draft,
      };

      const mockProducts: DataProductDto[] = [
        { id: 'product1', name: { de: 'Product 1' } },
        { id: 'product2', name: { de: 'Product 2' } },
        { id: 'product3', name: { de: 'Product 3' } },
      ];

      dataRequestService.fetchDataRequest.mockResolvedValue(newRequest);
      masterDataService.__testSignals.dataProducts.set(mockProducts);

      const newFixture = TestBed.createComponent(DataRequestDetailsComponent);
      const newComponentRef = newFixture.componentRef;
      newComponentRef.setInput('dataRequestId', 'test-id');
      newFixture.detectChanges();
      await newFixture.whenStable();

      const productsList = newFixture.componentInstance['productsList']();
      expect(productsList).toHaveLength(2);
      expect(productsList).toEqual([
        { id: 'product1', name: { de: 'Product 1' } },
        { id: 'product2', name: { de: 'Product 2' } },
      ]);
    });
  });

  describe('handleClose', () => {
    it('should navigate to admin path with refreshListNeeded false by default', () => {
      const router = TestBed.inject(Router);
      const routerSpy = jest.spyOn(router, 'navigate');

      component['handleClose']();

      expect(routerSpy).toHaveBeenCalledWith([ROUTE_PATHS.ADMIN_PATH], {
        state: { [FORCE_RELOAD_DATA_REQUESTS_STATE_PARAM]: false },
      });
    });

    it('should navigate to admin path with refreshListNeeded true when set', () => {
      const router = TestBed.inject(Router);
      const routerSpy = jest.spyOn(router, 'navigate');
      component['refreshListNeeded'].set(true);

      component['handleClose']();

      expect(routerSpy).toHaveBeenCalledWith([ROUTE_PATHS.ADMIN_PATH], {
        state: { [FORCE_RELOAD_DATA_REQUESTS_STATE_PARAM]: true },
      });
    });

    it('should be called when sidepanel emits closeSidepanel', async () => {
      const newRequest: DataRequestDto = {
        id: 'test-id',
        stateCode: ConsentRequestDetailViewDtoDataRequestStateCode.Draft,
      };

      dataRequestService.fetchDataRequest.mockResolvedValue(newRequest);

      const newFixture = TestBed.createComponent(DataRequestDetailsComponent);
      const newComponentRef = newFixture.componentRef;
      newComponentRef.setInput('dataRequestId', 'test-id');
      newFixture.detectChanges();
      await newFixture.whenStable();

      const router = TestBed.inject(Router);
      const routerSpy = jest.spyOn(router, 'navigate');
      const sidepanel = newFixture.debugElement.query(By.directive(SidepanelComponent));

      sidepanel.componentInstance.closeSidepanel.emit();

      expect(routerSpy).toHaveBeenCalledWith([ROUTE_PATHS.ADMIN_PATH], {
        state: { [FORCE_RELOAD_DATA_REQUESTS_STATE_PARAM]: false },
      });
    });
  });

  describe('acceptRequest', () => {
    it('should call approveDataRequest and reload resource on success', async () => {
      const mockResponse: DataRequestDto = {
        id: 'test-id',
        stateCode: ConsentRequestDetailViewDtoDataRequestStateCode.ToBeSigned,
      };
      dataRequestService.approveDataRequest.mockResolvedValue(mockResponse);
      const reloadSpy = jest.spyOn(component['dataRequestResource'], 'reload');

      component['acceptRequest']();
      await new Promise((resolve) => setTimeout(resolve, 0)); // Wait for promise chain

      expect(dataRequestService.approveDataRequest).toHaveBeenCalledWith('test-id');
      expect(component['refreshListNeeded']()).toBe(true);
      expect(reloadSpy).toHaveBeenCalled();
    });

    it('should handle errors from approveDataRequest', async () => {
      const testError = new Error('Approval failed');
      dataRequestService.approveDataRequest.mockRejectedValue(testError);

      component['acceptRequest']();
      await new Promise((resolve) => setTimeout(resolve, 0)); // Wait for promise chain

      expect(errorService.handleError).toHaveBeenCalledWith(testError);
      expect(component['refreshListNeeded']()).toBe(false);
    });
  });

  describe('rejectRequest', () => {
    it('should call retreatDataRequest and reload resource on success', async () => {
      const mockResponse: DataRequestDto = {
        id: 'test-id',
        stateCode: ConsentRequestDetailViewDtoDataRequestStateCode.Draft,
      };
      dataRequestService.retreatDataRequest.mockResolvedValue(mockResponse);
      const reloadSpy = jest.spyOn(component['dataRequestResource'], 'reload');

      component['rejectRequest']();
      await new Promise((resolve) => setTimeout(resolve, 0)); // Wait for promise chain

      expect(dataRequestService.retreatDataRequest).toHaveBeenCalledWith('test-id');
      expect(component['refreshListNeeded']()).toBe(true);
      expect(reloadSpy).toHaveBeenCalled();
    });

    it('should handle errors from retreatDataRequest', async () => {
      const testError = new Error('Rejection failed');
      dataRequestService.retreatDataRequest.mockRejectedValue(testError);

      component['rejectRequest']();
      await new Promise((resolve) => setTimeout(resolve, 0)); // Wait for promise chain

      expect(errorService.handleError).toHaveBeenCalledWith(testError);
      expect(component['refreshListNeeded']()).toBe(false);
    });
  });

  describe('getStatusTranslation', () => {
    it('should return translated status for valid stateCode', () => {
      const result = component['getStatusTranslation'](
        ConsentRequestDetailViewDtoDataRequestStateCode.Draft,
      );
      expect(result).toBeDefined();
    });

    it('should return empty string for undefined stateCode', () => {
      const result = component['getStatusTranslation'](undefined);
      expect(result).toBe('');
    });
  });
});
