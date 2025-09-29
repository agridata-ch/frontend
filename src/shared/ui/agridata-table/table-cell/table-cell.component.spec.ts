import { Component, TemplateRef, ViewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CellRendererTypes, ColumnDefinition } from '@/shared/ui/agridata-table';

import { TableCellComponent } from './table-cell.component';

/**
 * Component to test template rendering
 * CommentLastReviewed: 2025-09-29
 */
@Component({
  standalone: true,
  template: ` <ng-template #testTemplate let-row> Template: {{ row.value }}</ng-template> `,
})
class TestHostComponent {
  @ViewChild('testTemplate') testTemplate!: TemplateRef<any>;
}

describe('TableCellComponent', () => {
  let component: TableCellComponent<any>;
  let fixture: ComponentFixture<TableCellComponent<any>>;
  let hostComponent: TestHostComponent;
  let hostFixture: ComponentFixture<TestHostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TableCellComponent, TestHostComponent],
    }).compileComponents();

    hostFixture = TestBed.createComponent(TestHostComponent);
    hostComponent = hostFixture.componentInstance;
    hostFixture.detectChanges();

    fixture = TestBed.createComponent(TableCellComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('formatCellValue', () => {
    it('should handle null and undefined values', () => {
      expect(component['formatCellValue'](null)).toBe('');
      expect(component['formatCellValue'](undefined)).toBe('');
    });

    it('should handle number values', () => {
      expect(component['formatCellValue'](42)).toBe(42);
      expect(component['formatCellValue'](3.14)).toBe(3.14);
    });

    it('should handle boolean values', () => {
      expect(component['formatCellValue'](true)).toBe(true);
      expect(component['formatCellValue'](false)).toBe(false);
    });

    it('should handle Date objects', () => {
      const date = new Date('2024-01-15');
      expect(component['formatCellValue'](date)).toBe('15.01.2024');
    });

    it('should handle ISO date strings', () => {
      expect(component['formatCellValue']('2024-01-15')).toBe('15.01.2024');
    });

    it('should handle regular strings', () => {
      expect(component['formatCellValue']('test')).toBe('test');
    });
  });

  describe('rendering', () => {
    it('should render function cell renderer correctly', () => {
      const testRow = { value: 'test' };
      const columnDef: ColumnDefinition<typeof testRow> = {
        name: 'test',
        renderer: {
          type: CellRendererTypes.FUNCTION,
          cellRenderFn: (row) => row.value,
        },
      };

      fixture.componentRef.setInput('columnDefinition', columnDef);
      fixture.componentRef.setInput('row', testRow);
      fixture.detectChanges();

      const cellContent = fixture.nativeElement.querySelector('span');
      expect(cellContent.textContent.trim()).toBe('test');
    });

    it('should apply custom CSS classes', () => {
      const testRow = { value: 'test' };
      const columnDef: ColumnDefinition<typeof testRow> = {
        name: 'test',
        cellCssClasses: 'custom-class',
        renderer: {
          type: CellRendererTypes.FUNCTION,
          cellRenderFn: (row) => row.value,
        },
      };

      fixture.componentRef.setInput('columnDefinition', columnDef);
      fixture.componentRef.setInput('row', testRow);
      fixture.detectChanges();

      const td = fixture.nativeElement.querySelector('td');
      expect(td.classList.contains('custom-class')).toBeTruthy();
    });

    it('should render template cell renderer correctly', () => {
      const testRow = { value: 'test' };
      const columnDef: ColumnDefinition<typeof testRow> = {
        name: 'test',
        renderer: {
          type: CellRendererTypes.TEMPLATE,
          template: hostComponent.testTemplate,
        },
      };

      fixture.componentRef.setInput('columnDefinition', columnDef);
      fixture.componentRef.setInput('row', testRow);
      fixture.detectChanges();

      expect(fixture.nativeElement.textContent).toContain('Template: test');
    });
  });
});
