import { ComponentRef } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContractRevisionService } from '@/entities/api';
import { DataRequestDto, DataRequestStateEnum } from '@/entities/openapi';
import { I18nService } from '@/shared/i18n';
import { AuthService } from '@/shared/lib/auth';
import { createMockI18nService } from '@/shared/testing/mocks';
import { createMockAuthService, MockAuthService } from '@/shared/testing/mocks/mock-auth-service';
import {
  createMockContractRevisionService,
  MockContractRevisionService,
} from '@/shared/testing/mocks/mock-contract-revision-service';
import { createTranslocoTestingModule } from '@/shared/testing/transloco-testing.module';

import { DataRequestFormContractComponent } from './data-request-form-contract.component';

describe('DataRequestFormContractComponent', () => {
  let component: DataRequestFormContractComponent;
  let fixture: ComponentFixture<DataRequestFormContractComponent>;
  let componentRef: ComponentRef<DataRequestFormContractComponent>;
  let authService: MockAuthService;
  let contractRevisionService: MockContractRevisionService;

  const mockDataRequest: DataRequestDto = {
    id: 'dr-1',
    stateCode: DataRequestStateEnum.InReview,
  };

  beforeEach(async () => {
    authService = createMockAuthService();
    contractRevisionService = createMockContractRevisionService();

    await TestBed.configureTestingModule({
      imports: [DataRequestFormContractComponent, createTranslocoTestingModule()],
      providers: [
        { provide: I18nService, useValue: createMockI18nService() },
        { provide: AuthService, useValue: authService },
        { provide: ContractRevisionService, useValue: contractRevisionService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DataRequestFormContractComponent);
    component = fixture.componentInstance;
    componentRef = fixture.componentRef;
    componentRef.setInput('dataRequest', mockDataRequest);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show contract signing when stateCode is ToBeSignedByConsumer', () => {
    componentRef.setInput('dataRequest', {
      id: 'dr-2',
      stateCode: DataRequestStateEnum.ToBeSignedByConsumer,
      currentContractRevisionId: 'cr-1',
    });
    fixture.detectChanges();

    const contractSigning = fixture.nativeElement.querySelector(
      'app-data-request-contract-signing',
    );
    expect(contractSigning).toBeTruthy();
  });

  it('should show alert when stateCode is not ToBeSignedByConsumer', () => {
    const alert = fixture.nativeElement.querySelector('app-alert');
    expect(alert).toBeTruthy();
  });
});
