/// <reference types="jest" />

import { signal } from '@angular/core';

import { ProductTourService } from '@/shared/product-tour/product-tour.service';
import { Mockify } from '@/shared/testing/mocks/test-model';

export type MockProductTourService = Omit<Mockify<ProductTourService>, 'i18nService'>;

/**
 * Replaces the product tour service with a simplified version for testing.
 *
 * CommentLastReviewed: 2026-03-02
 */
export function createMockProductTourService(): MockProductTourService {
  return {
    isActive: signal<boolean>(false),
    start: jest.fn(),
    stop: jest.fn(),
  };
}
