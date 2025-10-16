import { HttpErrorResponse } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';

import { CmsService } from '@/entities/cms';
import { ROUTE_PATHS } from '@/shared/constants/constants';
import { mockCmsResponse, mockCmsService } from '@/shared/testing/mocks';

import { PrivacyPolicyPage } from './privacy-policy-page.page';

describe('PrivacyPolicyPage', () => {
  let component: PrivacyPolicyPage;
  let fixture: ComponentFixture<PrivacyPolicyPage>;
  let mockRouter: jest.Mocked<Router>;

  beforeEach(async () => {
    mockRouter = {
      navigate: jest.fn(),
    } as unknown as jest.Mocked<Router>;

    await TestBed.configureTestingModule({
      providers: [
        { provide: CmsService, useValue: mockCmsService },
        { provide: Router, useValue: mockRouter },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PrivacyPolicyPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('computed signals', () => {
    it('content returns content from the CMS page data', () => {
      expect(component['content']()).toBe(mockCmsResponse.data.content);
    });

    it('footerBlock returns footer from the CMS page data', () => {
      expect(component['footerBlock']()).toBe(mockCmsResponse.data.footer);
    });
  });

  describe('errorEffect', () => {
    beforeEach(() => {
      fixture = TestBed.createComponent(PrivacyPolicyPage);
      component = fixture.componentInstance;
    });

    it('does navigate to not found page on error', () => {
      const httpErrorResponse = new HttpErrorResponse({ status: 404 });
      const mockError = new Error('Not found', { cause: httpErrorResponse });

      jest.spyOn(component['privacyPolicyResource'], 'error').mockReturnValue(mockError);

      fixture.detectChanges();

      expect(mockRouter.navigate).toHaveBeenCalledWith([ROUTE_PATHS.NOT_FOUND], {
        state: { error: 'Not found' },
      });
    });

    it('does navigate to error page on error', () => {
      const httpErrorResponse = new HttpErrorResponse({ status: 400 });
      const mockError = new Error('Error', { cause: httpErrorResponse });

      jest.spyOn(component['privacyPolicyResource'], 'error').mockReturnValue(mockError);

      fixture.detectChanges();

      expect(mockRouter.navigate).toHaveBeenCalledWith([ROUTE_PATHS.ERROR]);
    });
  });
});
