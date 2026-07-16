import { HttpErrorResponse } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';

import { AgbService } from '@/entities/api';
import { CmsService } from '@/entities/cms';
import { ROUTE_PATHS } from '@/shared/constants/constants';
import { I18nService } from '@/shared/i18n';
import {
  createMockAgbService,
  createMockI18nService,
  mockAgbRevision,
  mockCmsResponse,
  mockCmsService,
} from '@/shared/testing/mocks';

import { AgbPage } from './agb-page.page';

describe('AgbPage', () => {
  let component: AgbPage;
  let fixture: ComponentFixture<AgbPage>;
  let mockRouter: jest.Mocked<Router>;

  beforeEach(async () => {
    mockRouter = {
      navigate: jest.fn(),
    } as unknown as jest.Mocked<Router>;

    await TestBed.configureTestingModule({
      providers: [
        { provide: AgbService, useValue: createMockAgbService() },
        { provide: CmsService, useValue: mockCmsService },
        { provide: I18nService, useValue: createMockI18nService() },
        { provide: Router, useValue: mockRouter },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AgbPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('computed signals', () => {
    it('content returns the localized AGB text from the backend', async () => {
      fixture.detectChanges();
      await fixture.whenStable();

      expect(component['content']()).toBe(mockAgbRevision.agbText!.de);
    });

    it('footerBlock returns footer from the CMS page data', async () => {
      fixture.detectChanges();
      await fixture.whenStable();

      expect(component['footerBlock']()).toBe(mockCmsResponse.data.footer);
    });
  });

  describe('errorEffect', () => {
    beforeEach(() => {
      fixture = TestBed.createComponent(AgbPage);
      component = fixture.componentInstance;
    });

    it('does navigate to not found page on error', () => {
      const httpErrorResponse = new HttpErrorResponse({ status: 404 });
      const mockError = new Error('Not found', { cause: httpErrorResponse });

      jest.spyOn(component['agbPageResource'], 'error').mockReturnValue(mockError);

      fixture.detectChanges();

      expect(mockRouter.navigate).toHaveBeenCalledWith([ROUTE_PATHS.NOT_FOUND], {
        state: { error: 'Not found' },
      });
    });

    it('does navigate to error page on error', () => {
      const httpErrorResponse = new HttpErrorResponse({ status: 400 });
      const mockError = new Error('Error', { cause: httpErrorResponse });

      jest.spyOn(component['agbPageResource'], 'error').mockReturnValue(mockError);

      fixture.detectChanges();

      expect(mockRouter.navigate).toHaveBeenCalledWith([ROUTE_PATHS.ERROR]);
    });
  });
});
