import {
  HttpClient,
  HttpErrorResponse,
  provideHttpClient,
  withInterceptors,
} from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { agbConsentInterceptor } from '@/app/interceptors/agb-consent.interceptor';
import { AgridataStateService } from '@/entities/api/agridata-state.service';
import { environment } from '@/environments/environment';
import { createMockAgridataStateService, MockAgridataStateService } from '@/shared/testing/mocks';

describe('agbConsentInterceptor', () => {
  let httpClient: HttpClient;
  let httpMock: HttpTestingController;
  let stateService: MockAgridataStateService;

  beforeEach(() => {
    stateService = createMockAgridataStateService();

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([agbConsentInterceptor])),
        provideHttpClientTesting(),
        { provide: AgridataStateService, useValue: stateService },
      ],
    });

    httpClient = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it.each([
    ['POST', (url: string) => httpClient.post(url, {})],
    ['PUT', (url: string) => httpClient.put(url, {})],
    ['PATCH', (url: string) => httpClient.patch(url, {})],
    ['DELETE', (url: string) => httpClient.delete(url)],
  ])('rejects %s API requests with 423 while consent is blocked', (_method, request) => {
    stateService.__testSignals.agbConsentEnforced.set(true);
    const url = `${environment.apiBaseUrl}/data-products`;
    let error: HttpErrorResponse | undefined;

    request(url).subscribe({ error: (err: HttpErrorResponse) => (error = err) });

    httpMock.expectNone(url);
    expect(error?.status).toBe(423);
  });
});
