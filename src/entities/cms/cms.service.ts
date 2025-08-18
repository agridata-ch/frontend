import { HttpClient } from '@angular/common/http';
import { Injectable, inject, resource } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { environment } from '@/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class CmsService {
  private readonly apiUrl = environment.cmsBaseUrl;
  private readonly http = inject(HttpClient);

  readonly fetchLandingPage = resource({
    loader: () => {
      return firstValueFrom(this.http.get(`${this.apiUrl}/api/landing-page`));
    },
  });

  readonly fetchPage = (page: string) =>
    resource({
      loader: () => {
        return firstValueFrom(this.http.get(`${this.apiUrl}/api/pages/${page}`));
      },
    });
}
