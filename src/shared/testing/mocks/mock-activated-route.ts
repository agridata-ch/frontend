/// <reference types="jest" />

import { ActivatedRoute, convertToParamMap, ParamMap } from '@angular/router';

export interface MockActivatedRoute {
  snapshot: {
    paramMap: ParamMap;
    queryParamMap: ParamMap;
    queryParams: Record<string, string>;
  };
}

/**
 * Factory that creates a mock of `ActivatedRoute` for testing.
 * Uses Angular's convertToParamMap utility for proper ParamMap implementation.
 *
 * @param queryParams - Optional query parameters for the route
 * @param params - Optional route parameters
 */
export function createMockActivatedRoute(
  queryParams: Record<string, string> = {},
  params: Record<string, string> = {},
): MockActivatedRoute {
  return {
    snapshot: {
      paramMap: convertToParamMap(params),
      queryParamMap: convertToParamMap(queryParams),
      queryParams,
    },
  } as ActivatedRoute;
}
