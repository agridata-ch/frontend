import { ActivatedRouteSnapshot } from '@angular/router';

/** Query param carrying the data consumer's return URL. */
export const REDIRECT_URI_QUERY_PARAM = 'redirect_uri';

/** Reads the data consumer's redirect_uri query param from a route snapshot. */
export function getRedirectUri(route: ActivatedRouteSnapshot): string | undefined {
  return route.queryParamMap.get(REDIRECT_URI_QUERY_PARAM) ?? undefined;
}
