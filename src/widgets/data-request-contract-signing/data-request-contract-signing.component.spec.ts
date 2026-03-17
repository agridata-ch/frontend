import { ComponentRef } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContractRevisionService } from '@/entities/api';
import { I18nService } from '@/shared/i18n';
import { AuthService } from '@/shared/lib/auth';
import { createMockI18nService } from '@/shared/testing/mocks';
import { createMockAuthService, MockAuthService } from '@/shared/testing/mocks/mock-auth-service';
import {
  createMockContractRevisionService,
  mockContractRevision,
  MockContractRevisionService,
} from '@/shared/testing/mocks/mock-contract-revision-service';
import { createTranslocoTestingModule } from '@/shared/testing/transloco-testing.module';

import { DataRequestContractSigningComponent } from './data-request-contract-signing.component';

describe('DataRequestContractSigningComponent', () => {
  let component: DataRequestContractSigningComponent;
  let fixture: ComponentFixture<DataRequestContractSigningComponent>;
  let componentRef: ComponentRef<DataRequestContractSigningComponent>;
  let authService: MockAuthService;
  let contractRevisionService: MockContractRevisionService;

  beforeEach(async () => {
    authService = createMockAuthService();
    contractRevisionService = createMockContractRevisionService();

    await TestBed.configureTestingModule({
      imports: [DataRequestContractSigningComponent, createTranslocoTestingModule()],
      providers: [
        { provide: I18nService, useValue: createMockI18nService() },
        { provide: AuthService, useValue: authService },
        { provide: ContractRevisionService, useValue: contractRevisionService },
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

  it('companyName returns consumer name when user is a consumer', async () => {
    authService.__testSignals.isConsumer.set(true);
    const consumerFixture = TestBed.createComponent(DataRequestContractSigningComponent);
    consumerFixture.componentRef.setInput('contractId', 'cr-1');
    consumerFixture.detectChanges();
    await consumerFixture.whenStable();
    expect(consumerFixture.componentInstance.companyName()).toBe(
      mockContractRevision.dataConsumerName,
    );
  });

  it('companyName returns provider name when user is not a consumer', async () => {
    authService.__testSignals.isConsumer.set(false);
    const providerFixture = TestBed.createComponent(DataRequestContractSigningComponent);
    providerFixture.componentRef.setInput('contractId', 'cr-1');
    providerFixture.detectChanges();
    await providerFixture.whenStable();
    expect(providerFixture.componentInstance.companyName()).toBe(
      mockContractRevision.dataProviderName,
    );
  });
});
