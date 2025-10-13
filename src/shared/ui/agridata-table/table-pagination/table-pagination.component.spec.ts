import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { getTranslocoModule } from '@/app/transloco-testing.module';
import { PAGE_SIZES } from '@/shared/ui/agridata-table';

import { TablePaginationComponent } from './table-pagination.component';

describe('TablePaginationComponent', () => {
  let component: TablePaginationComponent;
  let fixture: ComponentFixture<TablePaginationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        TablePaginationComponent,
        getTranslocoModule({
          langs: {
            de: {
              table: {
                pageInfo: 'page {{ current }} of {{ total }}',
              },
            },
          },
        }),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TablePaginationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('page navigation', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('totalPages', 5);
    });

    it('should emit previous page index when navigating backwards', () => {
      const pageChangeSpy = jest.spyOn(component.pageChange, 'emit');
      fixture.componentRef.setInput('currentPageIndex', 2);

      component['navigateToPreviousPage']();
      expect(pageChangeSpy).toHaveBeenCalledWith(1);
    });

    it('should not navigate below page 0', () => {
      const pageChangeSpy = jest.spyOn(component.pageChange, 'emit');
      fixture.componentRef.setInput('currentPageIndex', 0);

      component['navigateToPreviousPage']();
      expect(pageChangeSpy).toHaveBeenCalledWith(0);
    });

    it('should emit next page index when navigating forwards', () => {
      const pageChangeSpy = jest.spyOn(component.pageChange, 'emit');
      fixture.componentRef.setInput('currentPageIndex', 2);

      component['navigateToNextPage']();
      expect(pageChangeSpy).toHaveBeenCalledWith(3);
    });

    it('should not navigate beyond last page', () => {
      const pageChangeSpy = jest.spyOn(component.pageChange, 'emit');
      fixture.componentRef.setInput('currentPageIndex', 4);

      component['navigateToNextPage']();
      expect(pageChangeSpy).toHaveBeenCalledWith(4);
    });
  });

  describe('navigation controls', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('totalPages', 5);
    });

    it('should disable previous button on first page', () => {
      fixture.componentRef.setInput('currentPageIndex', 0);
      expect(component['canNavigateToPrevious']()).toBeFalsy();
    });

    it('should enable previous button when not on first page', () => {
      fixture.componentRef.setInput('currentPageIndex', 1);
      expect(component['canNavigateToPrevious']()).toBeTruthy();
    });

    it('should disable next button on last page', () => {
      fixture.componentRef.setInput('currentPageIndex', 4);
      expect(component['canNavigateToNext']()).toBeFalsy();
    });

    it('should enable next button when not on last page', () => {
      fixture.componentRef.setInput('currentPageIndex', 3);
      expect(component['canNavigateToNext']()).toBeTruthy();
    });
  });

  describe('page size selection', () => {
    it('should initialize with default page sizes', () => {
      expect(component.SELECTABLE_PAGE_SIZES.length).toBe(PAGE_SIZES.length);
      expect(component.SELECTABLE_PAGE_SIZES[0].value).toBe(PAGE_SIZES[0]);
    });

    it('should emit page size change when selecting new size', () => {
      const pageSizeChangeSpy = jest.spyOn(component.pageSizeChange, 'emit');
      const newPageSize = 25;

      component.setNewPageSize(newPageSize);
      expect(pageSizeChangeSpy).toHaveBeenCalledWith(newPageSize);
    });

    it('should have default page size set', () => {
      expect(component.pageSize()).toBe(PAGE_SIZES[0]);
    });
  });

  describe('rendering', () => {
    it('should show correct page info', () => {
      fixture.componentRef.setInput('currentPageIndex', 2);
      fixture.componentRef.setInput('totalPages', 5);
      fixture.detectChanges();
      const spans = fixture.debugElement.queryAll(By.css('span'));
      const hasSpanWithPageInfo = spans.some(
        (span) => span.nativeElement.textContent.trim() === 'page 3 of 5',
      );
      expect(hasSpanWithPageInfo).toBeTruthy();
    });

    it('should disable navigation buttons appropriately', () => {
      fixture.componentRef.setInput('currentPageIndex', 0);
      fixture.componentRef.setInput('totalPages', 2);
      fixture.detectChanges();

      const prevButton = fixture.debugElement.query(By.css('[aria-label="table.previousPage"]'));
      const nextButton = fixture.debugElement.query(By.css('[aria-label="table.nextPage"]'));

      expect(prevButton.attributes['disabled']).toBe('');
      expect(nextButton.attributes['disabled']).toBeFalsy();
    });
  });
});
