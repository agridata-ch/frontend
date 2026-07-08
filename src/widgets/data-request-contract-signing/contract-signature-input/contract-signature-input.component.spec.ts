import { HttpErrorResponse, provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentRef } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ErrorHandlerService } from '@/app/error/error-handler.service';
import { ContractRevisionService } from '@/entities/api';
import { AgridataStateService } from '@/entities/api/agridata-state.service';
import { ExceptionEnum, SignatureSlotCodeEnum } from '@/entities/openapi';
import { I18nService } from '@/shared/i18n';
import { AuthService } from '@/shared/lib/auth';
import {
  createMockAgridataStateService,
  createMockAuthService,
  MockAuthService,
  createMockContractRevisionService,
  mockContractRevision,
  mockOtpChallenge,
  MockContractRevisionService,
  createMockErrorHandlerService,
  MockErrorHandlerService,
  createMockI18nService,
  MockI18nService,
  createMockToastService,
  MockToastService,
} from '@/shared/testing/mocks';
import { createTranslocoTestingModule } from '@/shared/testing/transloco-testing.module';
import { ToastService, ToastType } from '@/shared/toast';
import { SlotChallenge } from '@/widgets/data-request-contract-signing/data-request-contract-signing.model';

import { ContractSignatureInputComponent } from './contract-signature-input.component';

const mockChallenge: SlotChallenge = {
  challenge: mockOtpChallenge,
  slotId: SignatureSlotCodeEnum.DataConsumer01,
};

describe('ContractSignatureInputComponent', () => {
  let component: ContractSignatureInputComponent;
  let componentRef: ComponentRef<ContractSignatureInputComponent>;
  let fixture: ComponentFixture<ContractSignatureInputComponent>;
  let authService: MockAuthService;
  let contractRevisionService: MockContractRevisionService;
  let errorService: MockErrorHandlerService;
  let i18nService: MockI18nService;
  let toastService: MockToastService;

  beforeEach(async () => {
    authService = createMockAuthService();
    contractRevisionService = createMockContractRevisionService();
    errorService = createMockErrorHandlerService();
    i18nService = createMockI18nService();
    toastService = createMockToastService();

    await TestBed.configureTestingModule({
      imports: [ContractSignatureInputComponent, createTranslocoTestingModule()],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: AgridataStateService, useValue: createMockAgridataStateService() },
        { provide: AuthService, useValue: authService },
        { provide: ContractRevisionService, useValue: contractRevisionService },
        { provide: ErrorHandlerService, useValue: errorService },
        { provide: I18nService, useValue: i18nService },
        { provide: ToastService, useValue: toastService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ContractSignatureInputComponent);
    component = fixture.componentInstance;
    componentRef = fixture.componentRef;
    componentRef.setInput('slotId', SignatureSlotCodeEnum.DataConsumer01);
    componentRef.setInput('contractId', 'cr-1');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('position', () => {
    it('should return 1 for DataConsumer01', () => {
      componentRef.setInput('slotId', SignatureSlotCodeEnum.DataConsumer01);
      expect(component['position']()).toBe(1);
    });

    it('should return 1 for DataProvider01', () => {
      componentRef.setInput('slotId', SignatureSlotCodeEnum.DataProvider01);
      expect(component['position']()).toBe(1);
    });

    it('should return 2 for DataConsumer02', () => {
      componentRef.setInput('slotId', SignatureSlotCodeEnum.DataConsumer02);
      expect(component['position']()).toBe(2);
    });

    it('should return 2 for DataProvider02', () => {
      componentRef.setInput('slotId', SignatureSlotCodeEnum.DataProvider02);
      expect(component['position']()).toBe(2);
    });
  });

  describe('isActiveSigningSlot', () => {
    it('should be true when internal challenge slotId matches', async () => {
      component['handleStartSigning']();
      await fixture.whenStable();

      expect(component['isActiveSigningSlot']()).toBe(true);
    });

    it('should be false when no challenge is set', () => {
      expect(component['isActiveSigningSlot']()).toBe(false);
    });
  });

  describe('isResendDisabled', () => {
    it('should be false when countdownValue is 0', () => {
      component['countdownValue'].set(0);
      expect(component['isResendDisabled']()).toBe(false);
    });

    it('should be true when countdownValue is greater than 0', () => {
      component['countdownValue'].set(10);
      expect(component['isResendDisabled']()).toBe(true);
    });
  });

  describe('signedDateText', () => {
    it('should return empty string when no existingSignature', () => {
      componentRef.setInput('existingSignature', undefined);
      expect(component['signedDateText']()).toBe('');
    });

    it('should return a formatted date string when existingSignature has a timestamp', () => {
      componentRef.setInput('existingSignature', {
        name: 'Test User',
        signatureSlotCode: SignatureSlotCodeEnum.DataConsumer01,
        timestamp: '2026-03-20T10:00:00Z',
        userId: 'user-1',
      });
      const result = component['signedDateText']();
      expect(result).toBeTruthy();
      expect(result).toContain('2026');
    });
  });

  describe('handleStartSigning', () => {
    it('should call startSigningProcess and set the internal challenge on success', async () => {
      await component['handleStartSigning']();

      expect(contractRevisionService.startSigningProcess).toHaveBeenCalledWith(
        'cr-1',
        SignatureSlotCodeEnum.DataConsumer01,
        undefined,
      );
      expect(component['currentChallenge']()).toEqual(mockChallenge);
    });

    it('should start the resend countdown', () => {
      jest.useFakeTimers();
      component['handleStartSigning']();
      expect(component['countdownValue']()).toBeGreaterThan(0);
      jest.useRealTimers();
    });

    it('should set showResendCooldownAlert when OtpResendCooldown error is returned', async () => {
      contractRevisionService.startSigningProcess.mockRejectedValueOnce(
        new HttpErrorResponse({ error: { type: ExceptionEnum.OtpResendCooldown } }),
      );

      await component['handleStartSigning']();

      expect(component['showResendCooldownAlert']()).toBe(true);
    });

    it('should clear showResendCooldownAlert on successful start', async () => {
      component['showResendCooldownAlert'].set(true);
      await component['handleStartSigning']();

      expect(component['showResendCooldownAlert']()).toBe(false);
    });

    it('should call errorService for generic errors during start', async () => {
      const error = new HttpErrorResponse({ error: { type: ExceptionEnum.Generic } });
      contractRevisionService.startSigningProcess.mockRejectedValueOnce(error);

      await component['handleStartSigning']();

      expect(errorService.handleError).toHaveBeenCalledWith(error);
    });

    it('should not call startSigningProcess when contractId is not set', async () => {
      componentRef.setInput('contractId', undefined);

      await component['handleStartSigning']();

      expect(contractRevisionService.startSigningProcess).not.toHaveBeenCalled();
    });
  });

  describe('handleVerifySigning', () => {
    beforeEach(() => {
      component['currentChallenge'].set(mockChallenge);
      component['otpForm'].get('otpCode')?.setValue('123456');
    });

    it('should not call verifySigningProcess when otp form is invalid', async () => {
      component['otpForm'].get('otpCode')?.setValue('');
      component['handleVerifySigning'](new Event('submit'));
      await fixture.whenStable();

      expect(contractRevisionService.verifySigningProcess).not.toHaveBeenCalled();
    });

    it('should emit signingSuccess and show success toast on successful verification', async () => {
      const successSpy = jest.fn();
      component.signingSuccess.subscribe(successSpy);

      component['handleVerifySigning'](new Event('submit'));
      await fixture.whenStable();

      expect(contractRevisionService.verifySigningProcess).toHaveBeenCalledWith(
        mockOtpChallenge.challengeId,
        'cr-1',
        SignatureSlotCodeEnum.DataConsumer01,
        { otpCode: '123456' },
        undefined,
      );
      expect(toastService.show).toHaveBeenCalledWith(
        expect.anything(),
        expect.anything(),
        ToastType.Success,
      );
      expect(successSpy).toHaveBeenCalledWith(mockContractRevision);
      expect(component['currentChallenge']()).toBeNull();
    });

    it('should set otpInvalid error on OtpInvalid response', async () => {
      contractRevisionService.verifySigningProcess.mockRejectedValueOnce(
        new HttpErrorResponse({ error: { type: ExceptionEnum.OtpInvalid } }),
      );

      component['handleVerifySigning'](new Event('submit'));
      await fixture.whenStable();

      expect(component['otpForm'].get('otpCode')?.errors).toEqual({ otpInvalid: true });
    });

    it('should set otpExpired error on OtpExpired response', async () => {
      contractRevisionService.verifySigningProcess.mockRejectedValueOnce(
        new HttpErrorResponse({ error: { type: ExceptionEnum.OtpExpired } }),
      );

      component['handleVerifySigning'](new Event('submit'));
      await fixture.whenStable();

      expect(component['otpForm'].get('otpCode')?.errors).toEqual({ otpExpired: true });
    });

    it('should set otpLocked error and show locked alert on OtpLocked response', async () => {
      contractRevisionService.verifySigningProcess.mockRejectedValueOnce(
        new HttpErrorResponse({ error: { type: ExceptionEnum.OtpLocked } }),
      );

      component['handleVerifySigning'](new Event('submit'));
      await fixture.whenStable();

      expect(component['otpForm'].get('otpCode')?.errors).toEqual({ otpLocked: true });
      expect(component['showLockedAlert']()).toBe(true);
    });

    it('should clear showLockedAlert after successful verification', async () => {
      component['showLockedAlert'].set(true);

      component['handleVerifySigning'](new Event('submit'));
      await fixture.whenStable();

      expect(component['showLockedAlert']()).toBe(false);
    });

    it('should call errorService for generic errors during verify', async () => {
      const error = new HttpErrorResponse({ error: { type: ExceptionEnum.Generic } });
      contractRevisionService.verifySigningProcess.mockRejectedValueOnce(error);

      component['handleVerifySigning'](new Event('submit'));
      await fixture.whenStable();

      expect(errorService.handleError).toHaveBeenCalledWith(error);
    });
  });

  describe('handleResendOtp', () => {
    it('should call startSigningProcess and reset the otp form', async () => {
      component['currentChallenge'].set(mockChallenge);
      component['countdownValue'].set(0);
      component['otpForm'].get('otpCode')?.setValue('123456');

      component['handleResendOtp']();
      await fixture.whenStable();

      expect(contractRevisionService.startSigningProcess).toHaveBeenCalled();
      expect(component['otpForm'].get('otpCode')?.value).toBeNull();
    });

    it('should not resend when countdown is active', () => {
      component['countdownValue'].set(10);
      component['handleResendOtp']();

      expect(contractRevisionService.startSigningProcess).not.toHaveBeenCalled();
    });
  });
});
