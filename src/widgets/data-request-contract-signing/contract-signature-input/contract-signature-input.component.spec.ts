import { ComponentRef } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SignatureSlotCodeEnum } from '@/entities/openapi';
import { I18nService } from '@/shared/i18n';
import { AuthService } from '@/shared/lib/auth';
import { createMockI18nService, MockI18nService } from '@/shared/testing/mocks';
import { createMockAuthService, MockAuthService } from '@/shared/testing/mocks/mock-auth-service';
import { mockOtpChallenge } from '@/shared/testing/mocks/mock-contract-revision-service';
import { createTranslocoTestingModule } from '@/shared/testing/transloco-testing.module';
import { SlotChallenge } from '@/widgets/data-request-contract-signing/data-request-contract-signing.model';

import { ContractSignatureInputComponent } from './contract-signature-input.component';

describe('ContractSignatureInputComponent', () => {
  let component: ContractSignatureInputComponent;
  let componentRef: ComponentRef<ContractSignatureInputComponent>;
  let fixture: ComponentFixture<ContractSignatureInputComponent>;
  let authService: MockAuthService;
  let i18nService: MockI18nService;

  beforeEach(async () => {
    authService = createMockAuthService();
    i18nService = createMockI18nService();

    await TestBed.configureTestingModule({
      imports: [ContractSignatureInputComponent, createTranslocoTestingModule()],
      providers: [
        { provide: AuthService, useValue: authService },
        { provide: I18nService, useValue: i18nService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ContractSignatureInputComponent);
    component = fixture.componentInstance;
    componentRef = fixture.componentRef;
    componentRef.setInput('slotId', SignatureSlotCodeEnum.DataConsumer01);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('agbParts', () => {
    it('should parse agbParts when translation contains brackets', () => {
      i18nService.translate.mockImplementation(() => 'Before [Link Text] After');

      const newFixture = TestBed.createComponent(ContractSignatureInputComponent);
      newFixture.componentRef.setInput('slotId', SignatureSlotCodeEnum.DataConsumer01);
      newFixture.detectChanges();

      const parts = newFixture.componentInstance['agbParts']();
      expect(parts.before).toBe('Before ');
      expect(parts.linkText).toBe('Link Text');
      expect(parts.after).toBe(' After');
    });

    it('should return full text in before when translation has no brackets', () => {
      i18nService.translate.mockImplementation(() => 'No brackets here');

      const newFixture = TestBed.createComponent(ContractSignatureInputComponent);
      newFixture.componentRef.setInput('slotId', SignatureSlotCodeEnum.DataConsumer01);
      newFixture.detectChanges();

      const parts = newFixture.componentInstance['agbParts']();
      expect(parts.before).toBe('No brackets here');
      expect(parts.linkText).toBeNull();
      expect(parts.after).toBe('');
    });
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
    it('should be true when challenge slotId matches', () => {
      const challenge: SlotChallenge = {
        challenge: mockOtpChallenge,
        slotId: SignatureSlotCodeEnum.DataConsumer01,
      };
      componentRef.setInput('currentChallenge', challenge);
      expect(component['isActiveSigningSlot']()).toBe(true);
    });

    it('should be false when challenge slotId does not match', () => {
      const challenge: SlotChallenge = {
        challenge: mockOtpChallenge,
        slotId: SignatureSlotCodeEnum.DataConsumer02,
      };
      componentRef.setInput('currentChallenge', challenge);
      expect(component['isActiveSigningSlot']()).toBe(false);
    });

    it('should be false when no challenge is set', () => {
      componentRef.setInput('currentChallenge', null);
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
    it('should emit startSigning with the current slotId', () => {
      const spy = jest.spyOn(component.startSigning, 'emit');
      component['handleStartSigning']();
      expect(spy).toHaveBeenCalledWith(SignatureSlotCodeEnum.DataConsumer01);
    });

    it('should start the resend countdown after signing starts', () => {
      jest.useFakeTimers();
      component['handleStartSigning']();
      expect(component['countdownValue']()).toBeGreaterThan(0);
      jest.useRealTimers();
    });
  });

  describe('handleVerifySigning', () => {
    it('should not emit when otp form is invalid', () => {
      const spy = jest.spyOn(component.verifySigning, 'emit');
      component['handleVerifySigning'](new Event('submit'));
      expect(spy).not.toHaveBeenCalled();
    });

    it('should emit verifySigning when form is valid and challenge exists', () => {
      const challenge: SlotChallenge = {
        challenge: mockOtpChallenge,
        slotId: SignatureSlotCodeEnum.DataConsumer01,
      };
      componentRef.setInput('currentChallenge', challenge);
      component['otpForm'].get('otpCode')?.setValue('123456');

      const spy = jest.spyOn(component.verifySigning, 'emit');
      const event = new Event('submit');
      jest.spyOn(event, 'preventDefault');
      component['handleVerifySigning'](event);

      expect(spy).toHaveBeenCalledWith({
        challengeId: 'challenge-1',
        otpCode: '123456',
        slotId: SignatureSlotCodeEnum.DataConsumer01,
      });
    });

    it('should not emit when challengeId is missing', () => {
      componentRef.setInput('currentChallenge', null);
      component['otpForm'].get('otpCode')?.setValue('123456');

      const spy = jest.spyOn(component.verifySigning, 'emit');
      component['handleVerifySigning'](new Event('submit'));

      expect(spy).not.toHaveBeenCalled();
    });
  });

  describe('handleResendOtp', () => {
    it('should emit startSigning and reset the otp form', () => {
      component['otpForm'].get('otpCode')?.setValue('123456');
      const spy = jest.spyOn(component.startSigning, 'emit');

      component['handleResendOtp']();

      expect(spy).toHaveBeenCalled();
      expect(component['otpForm'].get('otpCode')?.value).toBeNull();
    });
  });
});
