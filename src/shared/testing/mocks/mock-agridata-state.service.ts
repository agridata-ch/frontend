import { signal } from '@angular/core';

import { AgridataStateService } from '@/entities/api/agridata-state.service';
import { UidDto } from '@/entities/openapi/model/uidDto';

export const mockAgridataStateService = (uid: string): Partial<AgridataStateService> => {
  return {
    userUidsLoaded: signal(false),
    setUids: jest.fn(),
    getDefaultUid: jest.fn().mockReturnValue(uid),
    setActiveUid: jest.fn(),
    activeUid: signal(uid),
    userUids: signal(mockUids),
    isImpersonating: jest.fn(),
  };
};

export const mockUids = [
  {
    uid: '1',
    name: 'Alpha',
  } as UidDto,
  {
    uid: '2',
    name: 'Beta',
  } as UidDto,
  {
    uid: '3',
    name: undefined, // This will test sorting with undefined names
  } as UidDto,
];
