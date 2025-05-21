import { Routes } from '@angular/router';
import { DefaultLayoutComponent } from '@app/layout/ui/default-layout.component';
import { ConsentRequestProducerPage } from '@pages/consent-request-producer/ui/consent-request-producer.page';
import { NotFoundPage } from '@pages/not-found/not-found.page';

export const routes: Routes = [
  {
    path: '',
    component: DefaultLayoutComponent,
    runGuardsAndResolvers: 'paramsChange',
    children: [
      { path: 'consent-requests', component: ConsentRequestProducerPage },
      { path: 'consent-requests/:consentRequestId', component: ConsentRequestProducerPage },
      { path: '', redirectTo: 'consent-requests', pathMatch: 'full' },
      { path: '**', component: NotFoundPage },
    ],
  },
];
