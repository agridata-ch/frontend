import { HttpInterceptorFn } from '@angular/common/http';

import { environment } from '@/environments/environment';
import { AGATE_LOGIN_ID_IMPERSONATION_HEADER } from '@/shared/constants/constants';

export const impersonationInterceptor: HttpInterceptorFn = (req, next) => {
  const agateLoginId = sessionStorage.getItem(AGATE_LOGIN_ID_IMPERSONATION_HEADER);

  if (agateLoginId && req.url.startsWith(environment.apiBaseUrl)) {
    const impersonatedReq = req.clone({
      headers: req.headers.set(AGATE_LOGIN_ID_IMPERSONATION_HEADER, agateLoginId),
    });
    return next(impersonatedReq);
  }

  return next(req);
};
