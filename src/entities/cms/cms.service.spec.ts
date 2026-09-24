import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { environment } from '@/environments/environment';

import { OnboardingFormData } from './cms.model';
import { CmsService } from './cms.service';

const mockOnboardingData: OnboardingFormData = {
  uid: '123',
  company: 'Acme AG',
  country: 'CH',
  street: 'Hauptstrasse',
  number: '1',
  postalCode: '3000',
  city: 'Bern',
  contactPerson: {
    salutation: 'Mr',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    phone: '+41791234567',
  },
  persons: [
    {
      agateNumber: '12345',
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane@example.com',
      function: 'Manager',
      mobileNumber: '0123456789',
    },
  ],
};

describe('CmsService', () => {
  let service: CmsService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CmsService, provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(CmsService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('fetchOnboardingPage', () => {
    it('sends a GET request to the onboarding endpoint with locale and draft status', () => {
      service.fetchOnboardingPage('de');

      const req = httpMock.expectOne(
        `${environment.cmsBaseUrl}/api/onboarding?locale=de&status=draft`,
      );
      expect(req.request.method).toBe('GET');
      req.flush({ data: {} });
    });

    it('uses the provided locale in the request URL', () => {
      service.fetchOnboardingPage('fr');

      const req = httpMock.expectOne(
        `${environment.cmsBaseUrl}/api/onboarding?locale=fr&status=draft`,
      );
      expect(req.request.method).toBe('GET');
      req.flush({ data: {} });
    });
  });

  describe('fetchNewsArticles', () => {
    const today = new Date().toISOString().slice(0, 10);
    const endDateFilter = `&filters[$or][0][endDate][$null]=true&filters[$or][1][endDate][$gte]=${today}`;

    it('sends a GET request with locale, stable sort, pagination, endDate filter and draft status', () => {
      service.fetchNewsArticles('de', 2, 9);

      const req = httpMock.expectOne(
        `${environment.cmsBaseUrl}/api/news-articles?locale=de` +
          `&sort=publishedAt:desc,id:desc&pagination[page]=2&pagination[pageSize]=9` +
          `${endDateFilter}&status=draft`,
      );
      expect(req.request.method).toBe('GET');
      req.flush({ data: [], meta: { pagination: {} } });
    });

    it('uses the provided locale, page and page size', () => {
      service.fetchNewsArticles('fr', 1, 25);

      const req = httpMock.expectOne(
        `${environment.cmsBaseUrl}/api/news-articles?locale=fr` +
          `&sort=publishedAt:desc,id:desc&pagination[page]=1&pagination[pageSize]=25` +
          `${endDateFilter}&status=draft`,
      );
      expect(req.request.method).toBe('GET');
      req.flush({ data: [], meta: { pagination: {} } });
    });
  });

  describe('submitOnboardingForm', () => {
    it('sends a POST request to the onboarding form endpoint', () => {
      service.submitOnboardingForm(mockOnboardingData);

      const req = httpMock.expectOne(environment.cmsOnboardingFormUrl);
      expect(req.request.method).toBe('POST');
      req.flush(null);
    });

    it('sends the form data as the request body', () => {
      service.submitOnboardingForm(mockOnboardingData);

      const req = httpMock.expectOne(environment.cmsOnboardingFormUrl);
      expect(req.request.body).toEqual(mockOnboardingData);
      req.flush(null);
    });

    it('includes credentials with the request', () => {
      service.submitOnboardingForm(mockOnboardingData);

      const req = httpMock.expectOne(environment.cmsOnboardingFormUrl);
      expect(req.request.withCredentials).toBe(true);
      req.flush(null);
    });
  });
});
