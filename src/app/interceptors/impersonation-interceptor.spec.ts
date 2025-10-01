import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { impersonationInterceptor } from '@/app/interceptors/impersonation-interceptor';
import { environment } from '@/environments/environment';
import { KTIDP_IMPERSONATION_QUERY_PARAM } from '@/shared/constants/constants';

describe('impersonationInterceptor', () => {
  let httpClient: HttpClient;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([impersonationInterceptor])),
        provideHttpClientTesting(),
      ],
    });

    httpClient = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);

    // Clear any previous sessionStorage data before each test
    sessionStorage.clear();
  });

  afterEach(() => {
    httpMock.verify();
    sessionStorage.clear();
  });

  // Your test cases remain the same...
  it('should add X-Impersonated-KtIdP header when ktIdP is in sessionStorage and URL starts with API base URL', () => {
    const testKtIdP = 'test-user-id';
    sessionStorage.setItem(KTIDP_IMPERSONATION_QUERY_PARAM, testKtIdP);

    // Make request to API URL
    httpClient.get(`${environment.apiBaseUrl}/some-endpoint`).subscribe();

    const req = httpMock.expectOne(`${environment.apiBaseUrl}/some-endpoint`);
    expect(req.request.method).toBe('GET');
    expect(req.request.headers.has('X-Impersonated-KtIdP')).toBeTruthy();
    expect(req.request.headers.get('X-Impersonated-KtIdP')).toBe(testKtIdP);

    req.flush({});
  });

  it('should not add header when ktIdP is not in sessionStorage', () => {
    httpClient.get(`${environment.apiBaseUrl}/some-endpoint`).subscribe();

    const req = httpMock.expectOne(`${environment.apiBaseUrl}/some-endpoint`);
    expect(req.request.headers.has('X-Impersonated-KtIdP')).toBeFalsy();

    req.flush({});
  });

  it('should not add header when URL does not start with API base URL', () => {
    const testKtIdP = 'test-user-id';
    sessionStorage.setItem(KTIDP_IMPERSONATION_QUERY_PARAM, testKtIdP);

    // Make request to non-API URL
    httpClient.get('https://example.com/some-endpoint').subscribe();

    const req = httpMock.expectOne('https://example.com/some-endpoint');
    expect(req.request.headers.has('X-Impersonated-KtIdP')).toBeFalsy();

    req.flush({});
  });

  it('should preserve existing headers when adding impersonation header', () => {
    const testKtIdP = 'test-user-id';
    sessionStorage.setItem(KTIDP_IMPERSONATION_QUERY_PARAM, testKtIdP);

    // Make request with custom header
    httpClient
      .get(`${environment.apiBaseUrl}/some-endpoint`, {
        headers: { 'Custom-Header': 'test-value' },
      })
      .subscribe();

    const req = httpMock.expectOne(`${environment.apiBaseUrl}/some-endpoint`);
    expect(req.request.headers.has('X-Impersonated-KtIdP')).toBeTruthy();
    expect(req.request.headers.get('X-Impersonated-KtIdP')).toBe(testKtIdP);
    expect(req.request.headers.has('Custom-Header')).toBeTruthy();
    expect(req.request.headers.get('Custom-Header')).toBe('test-value');

    req.flush({});
  });
});
