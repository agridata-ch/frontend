import { ComponentFixture, TestBed } from '@angular/core/testing';
import { faArrowDown, faArrowUp } from '@fortawesome/pro-regular-svg-icons';

import { ColumnDefinition, SortDirections } from '@/shared/ui/agridata-table';

import { TableHeaderCellComponent } from './table-header-cell.component';

describe('TableHeaderCellComponent', () => {
  let component: TableHeaderCellComponent<any>;
  let fixture: ComponentFixture<TableHeaderCellComponent<any>>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TableHeaderCellComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TableHeaderCellComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('sorting', () => {
    let testColumn: ColumnDefinition<any>;

    beforeEach(() => {
      testColumn = {
        name: 'test.column',
        sortable: true,
        renderer: {
          type: 'function',
          cellRenderFn: () => '',
        },
      };
      fixture.componentRef.setInput('columnDefinition', testColumn);
    });

    it('should emit sort direction change when clicking sortable column', () => {
      const sortSpy = jest.spyOn(component.sortChange, 'emit');

      component['toggleColumnSort']();
      expect(sortSpy).toHaveBeenCalledWith(SortDirections.DESC);
    });

    it('should toggle between ASC and DESC sort directions', () => {
      const sortSpy = jest.spyOn(component.sortChange, 'emit');

      fixture.componentRef.setInput('sortDirection', SortDirections.DESC);
      component['toggleColumnSort']();
      expect(sortSpy).toHaveBeenCalledWith(SortDirections.ASC);
    });

    it('should not emit sort change for non-sortable columns', () => {
      const sortSpy = jest.spyOn(component.sortChange, 'emit');
      testColumn.sortable = false;
      fixture.componentRef.setInput('columnDefinition', testColumn);

      component['toggleColumnSort']();
      expect(sortSpy).not.toHaveBeenCalled();
    });
  });

  describe('sort icons', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('columnDefinition', {
        name: 'test.column',
        renderer: {
          type: 'function',
          cellRenderFn: () => '',
        },
      });
    });

    it('should show no icon when no sort direction is set', () => {
      expect(component['getSortIcon']()).toBeUndefined();
    });

    it('should show down arrow for DESC sort', () => {
      fixture.componentRef.setInput('sortDirection', SortDirections.DESC);
      expect(component['getSortIcon']()).toBe(faArrowDown);
    });

    it('should show up arrow for ASC sort', () => {
      fixture.componentRef.setInput('sortDirection', SortDirections.ASC);
      expect(component['getSortIcon']()).toBe(faArrowUp);
    });
  });

  describe('rendering', () => {
    it('should display column name', () => {
      fixture.componentRef.setInput('columnDefinition', {
        name: 'test.column',
        renderer: {
          type: 'function',
          cellRenderFn: () => '',
        },
      });
      fixture.detectChanges();

      const headerText = fixture.nativeElement.querySelector('th span').textContent;
      expect(headerText).toContain('test.column');
    });

    it('should apply custom header CSS classes', () => {
      fixture.componentRef.setInput('columnDefinition', {
        name: 'test.column',
        headerCssClasses: 'custom-header-class',
        renderer: {
          type: 'function',
          cellRenderFn: () => '',
        },
      });
      fixture.detectChanges();

      const header = fixture.nativeElement.querySelector('th');
      expect(header.classList.contains('custom-header-class')).toBeTruthy();
    });
  });
});
