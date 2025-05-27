import { Routes } from '@angular/router';
import { DefaultLayoutComponent } from '@app/layout/ui/default-layout.component';
import { ConsentRequestProducerPage } from '@pages/consent-request-producer/ui/consent-request-producer.page';
import { NotFoundPage } from '@pages/not-found/not-found.page';
import { LoginPage } from '@pages/login/login.page';
import { autoLoginPartialRoutesGuard } from 'angular-auth-oidc-client';
import { AuthorizationGuard } from './guards/auth.guard';

export const routes: Routes = [
  // #### public pages without authentication ####

  {
    // This route is used for the OIDC authentication response handling
    path: 'auth-response',
    component: DefaultLayoutComponent,
    pathMatch: 'full',
    children: [{ path: '', component: LoginPage }],
  },
  {
    path: '',
    canActivate: [AuthorizationGuard],
    component: DefaultLayoutComponent,
    pathMatch: 'full',
    children: [{ path: '', component: LoginPage }],
  },

  // #### protected pages with authentication ####
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
