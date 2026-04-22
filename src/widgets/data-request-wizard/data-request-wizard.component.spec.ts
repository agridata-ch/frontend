import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, withComponentInputBinding } from '@angular/router';

import { ErrorHandlerService } from '@/app/error/error-handler.service';
import { ContractRevisionService, DataRequestService, UidRegisterService } from '@/entities/api';
import { MasterDataService } from '@/entities/api/master-data.service';
import { ROUTE_PATHS } from '@/shared/constants/constants';
import { I18nService } from '@/shared/i18n';
import { AuthService } from '@/shared/lib/auth';
import { createMockDataRequestService, createMockI18nService } from '@/shared/testing/mocks';
import { createMockAuthService, MockAuthService } from '@/shared/testing/mocks/mock-auth-service';
import { createMockContractRevisionService } from '@/shared/testing/mocks/mock-contract-revision-service';
import { createMockErrorHandlerService } from '@/shared/testing/mocks/mock-error-handler.service';
import { createMockMasterDataService } from '@/shared/testing/mocks/mock-master-data-service';
import { createTranslocoTestingModule } from '@/shared/testing/transloco-testing.module';

import { DataRequestWizardComponent } from './data-request-wizard.component';

describe('DataRequestWizardComponent', () => {
  let fixture: ComponentFixture<DataRequestWizardComponent>;
  let component: DataRequestWizardComponent;
  let authService: MockAuthService;

  beforeEach(async () => {
    authService = createMockAuthService();

    await TestBed.configureTestingModule({
      imports: [DataRequestWizardComponent, createTranslocoTestingModule()],
      providers: [
        { provide: AuthService, useValue: authService },
        { provide: ContractRevisionService, useValue: createMockContractRevisionService() },
        { provide: DataRequestService, useValue: createMockDataRequestService() },
        { provide: I18nService, useValue: createMockI18nService() },
        { provide: MasterDataService, useValue: createMockMasterDataService() },
        { provide: UidRegisterService, useValue: createMockI18nService() },
        { provide: ErrorHandlerService, useValue: createMockErrorHandlerService() },
        provideRouter(
          [
            {
              path: `${ROUTE_PATHS.DATA_REQUESTS_CONSUMER_PATH}/:dataRequestId`,
              component: DataRequestWizardComponent,
            },
          ],
          withComponentInputBinding(),
        ),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DataRequestWizardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should use consumer wizard by default when user is not a data provider', () => {
    expect(authService.isDataProvider()).toBe(false);
  });

  it('should read isDataProvider from authService', () => {
    authService.__testSignals.isDataProvider.set(true);
    expect(authService.isDataProvider()).toBe(true);
  });
});
