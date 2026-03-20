import { OtpChallengeDto, SignatureSlotCodeEnum } from '@/entities/openapi';

export interface SlotChallenge {
  slotId: SignatureSlotCodeEnum;
  challenge: OtpChallengeDto;
}

export const RESEND_OTP_INTERVAL_MS = 30000;
