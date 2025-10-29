import { signal } from '@angular/core';

import { MetaDataService } from '@/entities/api/meta-data-service';

export const mockMetadataService: Partial<MetaDataService> = {
  getDataProducts: jest.fn().mockReturnValue(signal([])),
};
