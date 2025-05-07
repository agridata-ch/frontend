import { TestBed, ComponentFixture } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { AgridataTableComponent, CellTemplateDirective } from './agridata-table.component';
import { TableActionsComponent } from './table-actions/table-actions.component';
import { QueryList, TemplateRef } from '@angular/core';

interface TestItem {
  id: number;
  name: string;
}

describe('AgridataTableComponent', () => {
  let fixture: ComponentFixture<AgridataTableComponent<TestItem>>;
  let component: AgridataTableComponent<TestItem>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        AgridataTableComponent,
        CellTemplateDirective,
        TableActionsComponent,
        FontAwesomeModule,
        CommonModule,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent<AgridataTableComponent<TestItem>>(AgridataTableComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('columns computation', () => {
    it('should derive columns from first item', () => {
      component.data = [{ id: 1, name: 'Alice' }];
      expect(component.columns()).toEqual(['id', 'name']);
    });

    it('should return empty array when data is null or empty', () => {
      component.data = null;
      expect(component.columns()).toEqual([]);
      component.data = [];
      expect(component.columns()).toEqual([]);
    });
  });

  describe('sorting behavior', () => {
    beforeEach(() => {
      component.data = [
        { id: 2, name: 'Bob' },
        { id: 1, name: 'Alice' },
      ];
    });

    it('should sort descending by column', () => {
      component.setSort('id');
      expect(component.sortColumn()).toBe('id');
      expect(component.sortDirection()).toBe('desc');
      expect(component.sorted().map((item) => item.id)).toEqual([2, 1]);
    });

    it('should toggle to descending on same column click', () => {
      component.setSort('id');
      component.setSort('id');
      expect(component.sortDirection()).toBe('asc');
      expect(component.sorted().map((item) => item.id)).toEqual([1, 2]);
    });
  });

  describe('pagination behavior', () => {
    beforeEach(() => {
      const items: TestItem[] = Array.from({ length: 25 }, (_, i) => ({
        id: i + 1,
        name: `Item ${i + 1}`,
      }));
      component.pageSize = 10;
      component.data = items;
    });

    it('should calculate total pages correctly', () => {
      expect(component.totalPages()).toBe(3);
    });

    it('should return first page by default', () => {
      expect(component.paginated().length).toBe(10);
      expect(component.paginated()[0].id).toBe(1);
    });

    it('should navigate to next and previous pages', () => {
      component.nextPage();
      expect(component.currentPage()).toBe(2);
      expect(component.paginated()[0].id).toBe(11);

      component.prevPage();
      expect(component.currentPage()).toBe(1);
      expect(component.paginated()[0].id).toBe(1);
    });

    it('should not navigate beyond bounds', () => {
      component.prevPage();
      expect(component.currentPage()).toBe(1);

      component.currentPage.set(component.totalPages());
      component.nextPage();
      expect(component.currentPage()).toBe(component.totalPages());
    });
  });

  describe('template handling', () => {
    let idTemplateRef: TemplateRef<{ $implicit: TestItem }>;
    let nameTemplateRef: TemplateRef<{ $implicit: TestItem }>;

    beforeEach(() => {
      idTemplateRef = {} as TemplateRef<{ $implicit: TestItem }>;
      nameTemplateRef = {} as TemplateRef<{ $implicit: TestItem }>;

      // Set up mock cell templates that would normally be injected via ContentChildren
      const mockDirectives = [
        { column: 'id' as keyof TestItem, template: idTemplateRef },
        { column: 'name' as keyof TestItem, template: nameTemplateRef },
      ] as CellTemplateDirective<TestItem>[];

      // Mock the QueryList that would be populated by ContentChildren
      component.cellTemplates = {
        find: jest.fn((predicate) => mockDirectives.find(predicate)),
      } as unknown as QueryList<CellTemplateDirective<TestItem>>;
    });

    it('should return the correct template when it exists for a column', () => {
      const idTemplate = component.getTemplate('id');
      const nameTemplate = component.getTemplate('name');

      expect(idTemplate).toBe(idTemplateRef);
      expect(nameTemplate).toBe(nameTemplateRef);
    });

    it('should return null when a column template does not exist', () => {
      const nonExistentTemplate = component.getTemplate('status' as keyof TestItem);

      expect(nonExistentTemplate).toBeNull();
    });
  });
});
