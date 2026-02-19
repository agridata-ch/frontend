import { ComponentRef } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, withComponentInputBinding } from '@angular/router';

import { ErrorHandlerService } from '@/app/error/error-handler.service';
import { DataRequestService, UidRegisterService } from '@/entities/api';
import { MasterDataService } from '@/entities/api/master-data.service';
import { ROUTE_PATHS } from '@/shared/constants/constants';
import { I18nService } from '@/shared/i18n';
import { AuthService } from '@/shared/lib/auth';
import {
  createMockDataRequestService,
  createMockI18nService,
  MockDataRequestService,
} from '@/shared/testing/mocks';
import { createMockAuthService } from '@/shared/testing/mocks/mock-auth-service';
import {
  createMockErrorHandlerService,
  MockErrorHandlerService,
} from '@/shared/testing/mocks/mock-error-handler.service';
import { createMockMasterDataService } from '@/shared/testing/mocks/mock-master-data-service';

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
        { provide: DataRequestService, useValue: dataRequestService },
        { provide: ErrorHandlerService, useValue: errorService },
        { provide: I18nService, useValue: createMockI18nService() },
        { provide: AuthService, useValue: createMockAuthService() },
        { provide: UidRegisterService, useValue: createMockI18nService() },
        { provide: MasterDataService, useValue: createMockMasterDataService() },
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
    });
    componentRef.setInput('dataRequestId', 'test-id');

    fixture.detectChanges();
    await fixture.whenStable();

    expect(component['shouldShowActiveComponent']()).toBe(false);
  });
});
