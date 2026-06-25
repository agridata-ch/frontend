import { ComponentRef } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, withComponentInputBinding } from '@angular/router';

import { ErrorHandlerService } from '@/app/error/error-handler.service';
import { ContractRevisionService, DataRequestService, UidRegisterService } from '@/entities/api';
import { AgridataStateService } from '@/entities/api/agridata-state.service';
import { MasterDataService } from '@/entities/api/master-data.service';
import { ROUTE_PATHS } from '@/shared/constants/constants';
import { I18nService } from '@/shared/i18n';
import { AuthService } from '@/shared/lib/auth';
import {
  createMockAgridataStateService,
  createMockAuthService,
  createMockContractRevisionService,
  createMockDataRequestService,
  createMockErrorHandlerService,
  createMockI18nService,
  createMockMasterDataService,
  MockDataRequestService,
  MockErrorHandlerService,
} from '@/shared/testing/mocks';

import { DataRequestDetailsWrapperComponent } from './data-request-details-wrapper.component';

describe('DataRequestDetailsWrapperComponent', () => {
  let component: DataRequestDetailsWrapperComponent;
  let componentRef: ComponentRef<DataRequestDetailsWrapperComponent>;
  let fixture: ComponentFixture<DataRequestDetailsWrapperComponent>;
  let dataRequestService: MockDataRequestService;
  let errorService: MockErrorHandlerService;

  beforeEach(async () => {
    dataRequestService = createMockDataRequestService();
    errorService = createMockErrorHandlerService();

    await TestBed.configureTestingModule({
      imports: [DataRequestDetailsWrapperComponent],
      providers: [
        { provide: AgridataStateService, useValue: createMockAgridataStateService() },
        { provide: AuthService, useValue: createMockAuthService() },
        { provide: ContractRevisionService, useValue: createMockContractRevisionService() },
        { provide: DataRequestService, useValue: dataRequestService },
        { provide: ErrorHandlerService, useValue: errorService },
        { provide: I18nService, useValue: createMockI18nService() },
        { provide: MasterDataService, useValue: createMockMasterDataService() },
        { provide: UidRegisterService, useValue: createMockI18nService() },
        provideRouter(
          [
            {
              path: `${ROUTE_PATHS.DATA_REQUESTS_CONSUMER_PATH}/:dataRequestId`,
              component: DataRequestDetailsWrapperComponent,
            },
          ],
          withComponentInputBinding(),
        ),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DataRequestDetailsWrapperComponent);
    component = fixture.componentInstance;
    componentRef = fixture.componentRef;
    componentRef.setInput('dataRequestId', 'new');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set shouldShowActiveComponent to true when stateCode is ACTIVE', async () => {
    dataRequestService.fetchDataRequest.mockResolvedValueOnce({
      id: 'test-id',
      stateCode: 'ACTIVE',
      dataProviderId: 'provider-id',
      advantages: [],
    });
    componentRef.setInput('dataRequestId', 'test-id');

    fixture.detectChanges();
    await fixture.whenStable();

    expect(component['shouldShowActiveComponent']()).toBe(true);
  });

  it('should set shouldShowActiveComponent to false for non-ACTIVE states', async () => {
    dataRequestService.fetchDataRequest.mockResolvedValueOnce({
      id: 'test-id',
      stateCode: 'DRAFT',
      dataProviderId: 'provider-id',
      advantages: [],
    });
    componentRef.setInput('dataRequestId', 'test-id');

    fixture.detectChanges();
    await fixture.whenStable();

    expect(component['shouldShowActiveComponent']()).toBe(false);
  });
});
