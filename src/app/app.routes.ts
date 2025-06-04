import { Routes } from '@angular/router';
import { DefaultLayoutComponent } from '@app/layout/ui/default-layout.component';
import { ConsentRequestProducerPage } from '@pages/consent-request-producer/ui/consent-request-producer.page';
import { NotFoundPage } from '@pages/not-found/not-found.page';
import { autoLoginPartialRoutesGuard } from 'angular-auth-oidc-client';
import { AuthorizationGuard } from './guards/auth.guard';
import { LoginAuthGuard } from './guards/login.guard';

export const routes: Routes = [
  // #### public pages without authentication ####

  {
    // This route is used for the OIDC authentication response handling
    path: 'auth-response',
    component: DefaultLayoutComponent,
    pathMatch: 'full',
  },
  {
    path: '',
    component: DefaultLayoutComponent,
    pathMatch: 'full',
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
    path: '',
    component: DefaultLayoutComponent,
    runGuardsAndResolvers: 'paramsChange',
    canActivate: [autoLoginPartialRoutesGuard, AuthorizationGuard],
    data: { roles: ['agridata.ch.Agridata_Einwilliger'] },
    children: [
      {
        path: 'consent-requests',
        component: ConsentRequestProducerPage,
      },
      { path: 'consent-requests/:consentRequestId', component: ConsentRequestProducerPage },
    ],
  },
  // {
  //   // consumer routes
  //   path: '',
  //   component: DefaultLayoutComponent,
  //   runGuardsAndResolvers: 'paramsChange',
  //   canActivate: [autoLoginPartialRoutesGuard, AuthorizationGuard],
  //   data: { roles: ['agridata.ch.Agridata_Datenbezueger'] },
  //   children: [
  //     {
  //       path: 'consent-requests',
  //       component: ConsentRequestConsumerPage,
  //     },
  //     { path: 'consent-requests/:consentRequestId', component: ConsentRequestProducerPage },
  //   ],
  // },
  // #### general routes ####
  {
    path: '',
    component: DefaultLayoutComponent,
    runGuardsAndResolvers: 'paramsChange',
    canActivate: [autoLoginPartialRoutesGuard],
    children: [{ path: '**', component: NotFoundPage }],
  },
];
