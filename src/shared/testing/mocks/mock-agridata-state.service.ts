import { signal } from '@angular/core';

import { AgridataStateService } from '@/entities/api/agridata-state.service';

export const mockAgridataStateService = (uid: string): Partial<AgridataStateService> => {
  return {
    userUidsLoaded: signal(false),
    setUids: jest.fn(),
    getDefaultUid: jest.fn().mockReturnValue(uid),
    setActiveUid: jest.fn(),
    activeUid: signal(uid),
  };
};
