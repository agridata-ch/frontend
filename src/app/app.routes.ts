import { Routes } from '@angular/router';
import { DefaultLayoutComponent } from '@app/layout/ui/default-layout.component';
import { ConsentRequestProducerPage } from '@/pages/consent-request-producer/ui/consent-request-producer.page';

export const routes: Routes = [
  {
    path: '',
    component: DefaultLayoutComponent,
    children: [
      { path: 'consent-requests', component: ConsentRequestProducerPage },
      // any future "app" pages…
      { path: '', redirectTo: 'consent-requests', pathMatch: 'full' },
    ],
  },
];
