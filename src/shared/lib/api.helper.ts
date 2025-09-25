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
