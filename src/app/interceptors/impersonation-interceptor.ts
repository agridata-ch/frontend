import { HttpInterceptorFn } from '@angular/common/http';

import { environment } from '@/environments/environment';
import { KTIDP_IMPERSONATION_QUERY_PARAM } from '@/shared/constants/constants';

export const impersonationInterceptor: HttpInterceptorFn = (req, next) => {
  const ktIdP = sessionStorage.getItem(KTIDP_IMPERSONATION_QUERY_PARAM);

  if (ktIdP && req.url.startsWith(environment.apiBaseUrl)) {
    const impersonatedReq = req.clone({
      headers: req.headers.set('X-Impersonated-KtIdP', ktIdP),
    });
    return next(impersonatedReq);
  }

  return next(req);
};
