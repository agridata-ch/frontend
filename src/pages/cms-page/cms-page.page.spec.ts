import { HttpErrorResponse } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';

import { CmsService, PageLayoutType } from '@/entities/cms';
import { ROUTE_PATHS } from '@/shared/constants/constants';
import { mockCmsResponse, mockCmsService } from '@/shared/testing/mocks';

import { CmsPage } from './cms-page.page';

describe('CmsPage', () => {
  let component: CmsPage;
  let fixture: ComponentFixture<CmsPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [{ provide: CmsService, useValue: mockCmsService }, provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(CmsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('computed signals', () => {
    it('pageBlocks returns blocks from the CMS page data', () => {
      expect(component['pageBlocks']()).toBe(mockCmsResponse.data.blocks);
    });

    it('heroBlock returns hero from the CMS page data', () => {
      expect(component['heroBlock']()).toBe(mockCmsResponse.data.hero);
    });

    it('footerBlock returns footer from the CMS page data', () => {
      expect(component['footerBlock']()).toBe(mockCmsResponse.data.footer);
    });

    it('layoutType defaults to DEFAULT when the page has no layout_type', () => {
      expect(component['layoutType']()).toBe(PageLayoutType.DEFAULT);
    });

    it('layoutType returns the page layout_type when set', async () => {
      mockCmsService.fetchCmsPage.mockResolvedValueOnce({
        ...mockCmsResponse,
        data: { ...mockCmsResponse.data, layout_type: PageLayoutType.NEWS_BLOG },
      });

      const testFixture = TestBed.createComponent(CmsPage);
      testFixture.detectChanges();
      await testFixture.whenStable();
      testFixture.detectChanges();

      expect(testFixture.componentInstance['layoutType']()).toBe(PageLayoutType.NEWS_BLOG);
    });
  });

  describe('errorEffect', () => {
    beforeEach(() => {
      fixture = TestBed.createComponent(CmsPage);
      component = fixture.componentInstance;
    });

    it('does navigate to not found page on error', () => {
      const httpErrorResponse = new HttpErrorResponse({ status: 404 });
      const mockError = new Error('Not found', { cause: httpErrorResponse });

      vi.spyOn(component['cmsPageResource'], 'error').mockReturnValue(mockError);

      const router = TestBed.inject(Router);
      const navSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true as any);

      fixture.detectChanges();

      expect(navSpy).toHaveBeenCalledWith([ROUTE_PATHS.NOT_FOUND], {
        state: { error: 'Not found' },
      });
    });

    it('does navigate to error page on error', () => {
      const httpErrorResponse = new HttpErrorResponse({ status: 400 });
      const mockError = new Error('Error', { cause: httpErrorResponse });

      vi.spyOn(component['cmsPageResource'], 'error').mockReturnValue(mockError);

      const router = TestBed.inject(Router);
      const navSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true as any);

      fixture.detectChanges();

      expect(navSpy).toHaveBeenCalledWith([ROUTE_PATHS.ERROR]);
    });
  });
});
