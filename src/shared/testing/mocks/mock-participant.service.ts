import { UserService } from '@/entities/api/user.service';
import { UidDto } from '@/entities/openapi';

export const mockParticipantService: Partial<UserService> = {
  getAuthorizedUids: jest.fn().mockReturnValue(Promise.resolve([{ uid: '123' } as UidDto])),
};
