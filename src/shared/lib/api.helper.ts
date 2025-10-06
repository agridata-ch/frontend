import { ResourceRef, Signal, computed, effect } from '@angular/core';

import { ErrorHandlerService } from '@/app/error/error-handler.service';

export interface PageResponseDto<T> {
  items: Array<T>;
  totalItems: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}

export function asPageResponse<T, R extends PageResponseDto<T>>(response: R): PageResponseDto<T> {
  return response as PageResponseDto<T>;
}

export function arrayToObjectSortParams(sortParams: Array<string> | undefined, paramName: string) {
  if (!sortParams) {
    return undefined;
  }
  if (sortParams.length > 1) {
    console.warn(
      'sortparam is > 1. A bug in openapi generator prevents this from being mapped to parameters successfully',
      sortParams,
    );
  }
  const sortObj: Record<string, string> = {};
  sortParams.forEach((param) => (sortObj[paramName] = param));
  return sortObj;
}

export function createResourceErrorHandlerEffect<T>(
  resource: ResourceRef<T>,
  errorService: ErrorHandlerService,
) {
  return effect(() => {
    const error = resource.error();
    if (error) {
      errorService.handleError(error);
    }
  });
}

export function createResourceValueComputed<T>(
  resource: ResourceRef<T>,
  fallbackValue: T = [] as T,
): Signal<T> {
  return computed(() => (resource.error() ? fallbackValue : resource.value()));
}
