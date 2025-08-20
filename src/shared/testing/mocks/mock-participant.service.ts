import { ParticipantService } from '@/entities/api/participant.service';
import { UidDto } from '@/entities/openapi';

export const mockParticipantService: Partial<ParticipantService> = {
  getAuthorizedUids: jest.fn().mockReturnValue(Promise.resolve([{ uid: '123' } as UidDto])),
};
