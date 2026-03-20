import { OtpChallengeDto, SignatureSlotCodeEnum } from '@/entities/openapi';

export interface SlotChallenge {
  slotId: SignatureSlotCodeEnum;
  challenge: OtpChallengeDto;
}
