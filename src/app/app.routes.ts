import { Routes } from '@angular/router';
import { autoLoginPartialRoutesGuard } from 'angular-auth-oidc-client';

import { CreateConsentRequestGuard } from '@/app/guards/create-consent-request.guard';
import { HomeRedirectGuard } from '@/app/guards/home-redirect.guard';
import { ImpersonationGuardGuard } from '@/app/guards/impersonation.guard';
import { ProducerUidGuard } from '@/app/guards/producer-uid.guard';
import { DefaultLayoutComponent, FullWidthLayoutComponent } from '@/app/layout';
import { CmsPage } from '@/pages/cms-page';
import { ConsentRequestProducerPage } from '@/pages/consent-request-producer';
import { DataRequestsConsumerPage } from '@/pages/data-requests-consumer';
import { ErrorPage } from '@/pages/error-page/error-page.component';
import { ForbiddenPage } from '@/pages/forbidden';
import { ImprintPage } from '@/pages/imprint-page';
import { LandingPage } from '@/pages/landing-page';
import { MaintenancePage } from '@/pages/maintenance';
import { NotFoundPage } from '@/pages/not-found';
import { PrivacyPolicyPage } from '@/pages/privacy-policy-page';
import { SupporterPageComponent } from '@/pages/supporter-page/';
import { ROUTE_PATHS, USER_ROLES } from '@/shared/constants/constants';
import { AuthorizationGuard } from '@/shared/lib/auth';

import { LoginAuthGuard } from './guards/login.guard';

export const routes: Routes = [
  // #### public pages without authentication ####

  {
    // This route is used for the OIDC authentication response handling
    path: 'auth-response',
    component: DefaultLayoutComponent,
    canActivate: [AuthorizationGuard],
    pathMatch: 'full',
  },
  {
    path: '',
    component: FullWidthLayoutComponent,
    canActivate: [AuthorizationGuard, ImpersonationGuardGuard, ProducerUidGuard, HomeRedirectGuard],
    children: [
      {
        path: '',
        component: LandingPage,
      },
    ],
  },
  {
    path: ROUTE_PATHS.IMPRESSUM_PATH,
    component: FullWidthLayoutComponent,
    canActivate: [AuthorizationGuard],
    children: [
      {
        path: '',
        component: ImprintPage,
      },
    ],
  },
  {
    path: ROUTE_PATHS.PRIVACY_POLICY_PATH,
    component: FullWidthLayoutComponent,
    canActivate: [AuthorizationGuard],
    children: [
      {
        path: '',
        component: PrivacyPolicyPage,
      },
    ],
  },
  {
    path: 'cms/:slug',
    component: FullWidthLayoutComponent,
    canActivate: [AuthorizationGuard, HomeRedirectGuard],
    children: [
      {
        path: '',
        component: CmsPage,
      },
    ],
  },

  // #### protected pages with authentication ####
  {
    // login page to get redirected from the auth provider which uses a specific guard that is only for this route
    path: 'login',
    component: DefaultLayoutComponent,
    canActivate: [autoLoginPartialRoutesGuard, LoginAuthGuard],
  },
  {
    // producer routes
    path: `${ROUTE_PATHS.CONSENT_REQUEST_PRODUCER_PATH}`,
    component: DefaultLayoutComponent,
    runGuardsAndResolvers: 'paramsChange',
    canActivate: [autoLoginPartialRoutesGuard, AuthorizationGuard, ImpersonationGuardGuard],
    data: { roles: [USER_ROLES.AGRIDATA_CONSENT_REQUESTS_PRODUCER, USER_ROLES.AGRIDATA_SUPPORTER] },
    children: [
      {
        path: ``,
        component: ConsentRequestProducerPage,
        canActivate: [ProducerUidGuard],
      },
      {
        path: `${ROUTE_PATHS.CONSENT_REQUEST_PRODUCER_CREATE_SUBPATH}/:dataRequestUid`,
        children: [],
        canActivate: [CreateConsentRequestGuard],
      },
      {
        path: `:uid`,
        component: ConsentRequestProducerPage,
        canActivate: [ProducerUidGuard],
      },
      {
        path: `:uid/:consentRequestId`,
        component: ConsentRequestProducerPage,
        canActivate: [ProducerUidGuard],
      },
    ],
  },
  {
    // consumer routes
    path: ROUTE_PATHS.DATA_REQUESTS_CONSUMER_PATH,
    component: DefaultLayoutComponent,
    runGuardsAndResolvers: 'paramsChange',
    canActivate: [autoLoginPartialRoutesGuard, AuthorizationGuard],
    data: { roles: [USER_ROLES.AGRIDATA_DATA_REQUESTS_CONSUMER] },
    children: [
      {
        path: '',
        component: DataRequestsConsumerPage,
      },
      {
        path: `:dataRequestId`,
        component: DataRequestsConsumerPage,
      },
    ],
  },
  {
    // support routes
    path: ROUTE_PATHS.SUPPORT_PATH,
    component: DefaultLayoutComponent,
    runGuardsAndResolvers: 'paramsChange',
    canActivate: [autoLoginPartialRoutesGuard, AuthorizationGuard],
    data: { roles: [USER_ROLES.AGRIDATA_SUPPORTER] },
    children: [
      {
        path: '',
        component: SupporterPageComponent,
      },
    ],
  },

  // #### general routes ####
  {
    path: ROUTE_PATHS.ERROR,
    component: DefaultLayoutComponent,
    runGuardsAndResolvers: 'paramsChange',
    canActivate: [AuthorizationGuard],
    children: [{ path: '**', component: ErrorPage }],
  },
  {
    path: ROUTE_PATHS.NOT_FOUND,
    component: FullWidthLayoutComponent,
    runGuardsAndResolvers: 'paramsChange',
    canActivate: [AuthorizationGuard],
    children: [{ path: '**', component: NotFoundPage }],
  },
  {
    path: ROUTE_PATHS.FORBIDDEN,
    component: FullWidthLayoutComponent,
    runGuardsAndResolvers: 'paramsChange',
    canActivate: [AuthorizationGuard],
    children: [{ path: '**', component: ForbiddenPage }],
  },
  {
    path: ROUTE_PATHS.MAINTENANCE,
    component: FullWidthLayoutComponent,
    runGuardsAndResolvers: 'paramsChange',
    canActivate: [AuthorizationGuard],
    children: [{ path: '**', component: MaintenancePage }],
  },
  {
    path: '',
    component: FullWidthLayoutComponent,
    runGuardsAndResolvers: 'paramsChange',
    canActivate: [AuthorizationGuard],
    children: [{ path: '**', component: NotFoundPage }],
  },
];
