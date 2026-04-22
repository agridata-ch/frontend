import { ComponentRef } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DataRequestStateEnum } from '@/entities/openapi';
import { AuthService } from '@/shared/lib/auth';
import { createMockAuthService, MockAuthService } from '@/shared/testing/mocks/mock-auth-service';
import { mockContractRevision } from '@/shared/testing/mocks/mock-contract-revision-service';
import { createTranslocoTestingModule } from '@/shared/testing/transloco-testing.module';

import { DataRequestCompletionSigningStatusComponent } from './data-request-completion-signing-status.component';

describe('DataRequestCompletionSigningStatusComponent', () => {
  let component: DataRequestCompletionSigningStatusComponent;
  let componentRef: ComponentRef<DataRequestCompletionSigningStatusComponent>;
  let fixture: ComponentFixture<DataRequestCompletionSigningStatusComponent>;
  let authService: MockAuthService;

  beforeEach(async () => {
    authService = createMockAuthService();

    await TestBed.configureTestingModule({
      imports: [DataRequestCompletionSigningStatusComponent, createTranslocoTestingModule()],
      providers: [{ provide: AuthService, useValue: authService }],
    }).compileComponents();

    fixture = TestBed.createComponent(DataRequestCompletionSigningStatusComponent);
    component = fixture.componentInstance;
    componentRef = fixture.componentRef;
    componentRef.setInput('contract', mockContractRevision);
    componentRef.setInput('dataRequestStateCode', DataRequestStateEnum.ToBeSignedByConsumer);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show provider signature waiting state for consumer when state is not ToBeActivated or ToBeReleasedByProvider', () => {
    authService.__testSignals.isConsumer.set(true);
    componentRef.setInput('dataRequestStateCode', DataRequestStateEnum.ToBeSignedByConsumer);
    fixture.detectChanges();
    expect(component['showProviderSignatureWaitingState']()).toEqual(true);
  });

  it('should not show provider signature waiting state for consumer when state is ToBeActivated', () => {
    authService.__testSignals.isConsumer.set(true);
    componentRef.setInput('dataRequestStateCode', DataRequestStateEnum.ToBeActivated);
    fixture.detectChanges();
    expect(component['showProviderSignatureWaitingState']()).toEqual(false);
  });

  it('should not show provider signature waiting state for consumer when state is ToBeReleasedByProvider', () => {
    authService.__testSignals.isConsumer.set(true);
    componentRef.setInput('dataRequestStateCode', DataRequestStateEnum.ToBeReleasedByProvider);
    fixture.detectChanges();
    expect(component['showProviderSignatureWaitingState']()).toEqual(false);
  });

  it('should not show provider signature waiting state for non-consumer', () => {
    authService.__testSignals.isConsumer.set(false);
    componentRef.setInput('dataRequestStateCode', DataRequestStateEnum.ToBeSignedByConsumer);
    fixture.detectChanges();
    expect(component['showProviderSignatureWaitingState']()).toEqual(false);
  });
});
