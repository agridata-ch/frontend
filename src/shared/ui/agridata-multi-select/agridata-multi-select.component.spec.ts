import { ComponentRef } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl } from '@angular/forms';

import { I18nService } from '@/shared/i18n';
import { createMockI18nService } from '@/shared/testing/mocks';
import { MultiSelectCategory } from '@/shared/ui/agridata-multi-select';

import { AgridataMultiSelectComponent } from './agridata-multi-select.component';

describe('AgridataMultiSelectComponent', () => {
  let fixture: ComponentFixture<AgridataMultiSelectComponent>;
  let component: AgridataMultiSelectComponent;
  let componentRef: ComponentRef<AgridataMultiSelectComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [AgridataMultiSelectComponent],
      providers: [{ provide: I18nService, useValue: createMockI18nService() }],
    }).compileComponents();

    fixture = TestBed.createComponent(AgridataMultiSelectComponent);
    component = fixture.componentInstance;
    componentRef = fixture.componentRef;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should toggle the dropdown open and closed', () => {
    expect(component.isDropdownOpen()).toBe(false);

    component['toggleDropdown']();
    expect(component.isDropdownOpen()).toBe(true);

    component['toggleDropdown']();
    expect(component.isDropdownOpen()).toBe(false);
  });

  it('should set the options and placeholder inputs', () => {
    const options = [
      { value: '1', label: 'Option 1' },
      { value: '2', label: 'Option 2' },
    ];
    const placeholder = 'Select options';

    componentRef.setInput('options', options);
    componentRef.setInput('placeholder', placeholder);

    expect(component.options()).toEqual(options);
    expect(component.placeholder()).toBe(placeholder);
  });

  it('should initialize selected options based on control value', () => {
    const options = [
      { value: '1', label: 'Option 1' },
      { value: '2', label: 'Option 2' },
      { value: '3', label: 'Option 3' },
    ];
    const control = new FormControl(['1', '3']);

    componentRef.setInput('options', options);
    componentRef.setInput('control', control);
    fixture.detectChanges();

    expect(component.selectedOptions()).toEqual([
      { value: '1', label: 'Option 1' },
      { value: '3', label: 'Option 3' },
    ]);
  });

  it('should handle empty control value', () => {
    const options = [
      { value: '1', label: 'Option 1' },
      { value: '2', label: 'Option 2' },
    ];
    const control = new FormControl(null);

    componentRef.setInput('options', options);
    componentRef.setInput('control', control);
    fixture.detectChanges();

    expect(component.selectedOptions()).toEqual([]);
  });

  it('should handle selecting and deselecting options', () => {
    const options = [
      { value: '1', label: 'Option 1' },
      { value: '2', label: 'Option 2' },
    ];
    const control = new FormControl([]);

    componentRef.setInput('options', options);
    componentRef.setInput('control', control);

    // Select an option
    const event = { target: { checked: true }, stopPropagation: () => {} } as unknown as Event;
    component['onOptionToggle']('1', event);
    expect(control.value).toEqual(['1']);
    expect(component.selectedOptions()).toEqual([{ value: '1', label: 'Option 1' }]);

    // Deselect the option
    const eventDeselect = {
      target: { checked: false },
      stopPropagation: () => {},
    } as unknown as Event;
    component['onOptionToggle']('1', eventDeselect);
    expect(control.value).toEqual([]);
    expect(component.selectedOptions()).toEqual([]);
  });

  describe('click outside behavior', () => {
    it('should close the dropdown when clicking outside', () => {
      component.isDropdownOpen.set(true);
      component['handleClickOutside']();
      expect(component.isDropdownOpen()).toBeFalsy();
    });
  });

  describe('customClass input', () => {
    it('should apply customClass to component', () => {
      componentRef.setInput('customClass', 'rounded-r-md border-l-0');
      fixture.detectChanges();

      expect(component.customClass()).toBe('rounded-r-md border-l-0');
    });
  });

  describe('categories and grouped mode', () => {
    const mockCategories: MultiSelectCategory[] = [
      {
        categoryLabel: 'Category A',
        options: [
          { value: 'a1', label: 'Option A1' },
          { value: 'a2', label: 'Option A2' },
        ],
      },
      {
        categoryLabel: 'Category B',
        options: [
          { value: 'b1', label: 'Option B1' },
          { value: 'b2', label: 'Option B2' },
        ],
      },
    ];

    it('should return isGrouped true when categories are provided', () => {
      componentRef.setInput('categories', mockCategories);
      fixture.detectChanges();

      expect(component['isGrouped']()).toBe(true);
    });

    it('should return isGrouped false when no categories are provided', () => {
      componentRef.setInput('options', [{ value: '1', label: 'Option 1' }]);
      fixture.detectChanges();

      expect(component['isGrouped']()).toBe(false);
    });

    it('should flatten category options in allOptions computed', () => {
      componentRef.setInput('categories', mockCategories);
      fixture.detectChanges();

      const allOptions = component['allOptions']();
      expect(allOptions).toHaveLength(4);
      expect(allOptions.map((o) => o.value)).toEqual(['a1', 'a2', 'b1', 'b2']);
    });
  });

  describe('select all functionality', () => {
    const mockCategories: MultiSelectCategory[] = [
      {
        categoryLabel: 'Category A',
        options: [
          { value: 'a1', label: 'Option A1' },
          { value: 'a2', label: 'Option A2' },
        ],
      },
      {
        categoryLabel: 'Category B',
        options: [
          { value: 'b1', label: 'Option B1' },
          { value: 'b2', label: 'Option B2' },
        ],
      },
    ];

    it('should check if all options in a category are selected', () => {
      const control = new FormControl(['a1', 'a2']);
      componentRef.setInput('categories', mockCategories);
      componentRef.setInput('control', control);
      fixture.detectChanges();

      expect(component['isCategoryAllSelected'](mockCategories[0])).toBe(true);
      expect(component['isCategoryAllSelected'](mockCategories[1])).toBe(false);
    });

    it('should select all options in a category when toggling on', () => {
      const control = new FormControl([]);
      componentRef.setInput('categories', mockCategories);
      componentRef.setInput('control', control);
      fixture.detectChanges();

      const event = {
        target: { checked: true },
        stopPropagation: jest.fn(),
      } as unknown as Event;
      component['onSelectAllToggle'](mockCategories[0], event);

      expect(control.value).toEqual(['a1', 'a2']);
      expect(event.stopPropagation).toHaveBeenCalled();
    });

    it('should deselect all options in a category when toggling off', () => {
      const control = new FormControl(['a1', 'a2', 'b1']);
      componentRef.setInput('categories', mockCategories);
      componentRef.setInput('control', control);
      fixture.detectChanges();

      const event = {
        target: { checked: false },
        stopPropagation: jest.fn(),
      } as unknown as Event;
      component['onSelectAllToggle'](mockCategories[0], event);

      expect(control.value).toEqual(['b1']);
    });

    it('should not duplicate values when selecting all on partially selected category', () => {
      const control = new FormControl(['a1']);
      componentRef.setInput('categories', mockCategories);
      componentRef.setInput('control', control);
      fixture.detectChanges();

      const event = {
        target: { checked: true },
        stopPropagation: jest.fn(),
      } as unknown as Event;
      component['onSelectAllToggle'](mockCategories[0], event);

      expect(control.value).toEqual(['a1', 'a2']);
    });
  });

  describe('singleCategorySelection mode', () => {
    const mockCategories: MultiSelectCategory[] = [
      {
        categoryLabel: 'Category A',
        options: [
          { value: 'a1', label: 'Option A1' },
          { value: 'a2', label: 'Option A2' },
        ],
      },
      {
        categoryLabel: 'Category B',
        options: [
          { value: 'b1', label: 'Option B1' },
          { value: 'b2', label: 'Option B2' },
        ],
      },
    ];

    it('should return null for activeCategoryLabel when singleCategorySelection is false', () => {
      const control = new FormControl(['a1']);
      componentRef.setInput('categories', mockCategories);
      componentRef.setInput('control', control);
      componentRef.setInput('singleCategorySelection', false);
      fixture.detectChanges();

      expect(component['activeCategoryLabel']()).toBeNull();
    });

    it('should return null for activeCategoryLabel when no options are selected', () => {
      const control = new FormControl([]);
      componentRef.setInput('categories', mockCategories);
      componentRef.setInput('control', control);
      componentRef.setInput('singleCategorySelection', true);
      fixture.detectChanges();

      expect(component['activeCategoryLabel']()).toBeNull();
    });

    it('should return category label when options from that category are selected', () => {
      const control = new FormControl(['a1']);
      componentRef.setInput('categories', mockCategories);
      componentRef.setInput('control', control);
      componentRef.setInput('singleCategorySelection', true);
      fixture.detectChanges();

      expect(component['activeCategoryLabel']()).toBe('Category A');
    });

    it('should not disable categories when singleCategorySelection is false', () => {
      const control = new FormControl(['a1']);
      componentRef.setInput('categories', mockCategories);
      componentRef.setInput('control', control);
      componentRef.setInput('singleCategorySelection', false);
      fixture.detectChanges();

      expect(component['isCategoryDisabled'](mockCategories[0])).toBe(false);
      expect(component['isCategoryDisabled'](mockCategories[1])).toBe(false);
    });

    it('should disable other categories when one category has selections', () => {
      const control = new FormControl(['a1']);
      componentRef.setInput('categories', mockCategories);
      componentRef.setInput('control', control);
      componentRef.setInput('singleCategorySelection', true);
      fixture.detectChanges();

      expect(component['isCategoryDisabled'](mockCategories[0])).toBe(false);
      expect(component['isCategoryDisabled'](mockCategories[1])).toBe(true);
    });

    it('should enable all categories when no options are selected', () => {
      const control = new FormControl([]);
      componentRef.setInput('categories', mockCategories);
      componentRef.setInput('control', control);
      componentRef.setInput('singleCategorySelection', true);
      fixture.detectChanges();

      expect(component['isCategoryDisabled'](mockCategories[0])).toBe(false);
      expect(component['isCategoryDisabled'](mockCategories[1])).toBe(false);
    });

    it('should always disable categories when component is disabled', () => {
      const control = new FormControl([]);
      componentRef.setInput('categories', mockCategories);
      componentRef.setInput('control', control);
      componentRef.setInput('disabled', true);
      fixture.detectChanges();

      expect(component['isCategoryDisabled'](mockCategories[0])).toBe(true);
      expect(component['isCategoryDisabled'](mockCategories[1])).toBe(true);
    });
  });

  describe('disabled state', () => {
    it('should not toggle options when disabled', () => {
      const control = new FormControl([]);
      componentRef.setInput('options', [{ value: '1', label: 'Option 1' }]);
      componentRef.setInput('control', control);
      componentRef.setInput('disabled', true);
      fixture.detectChanges();

      const event = { target: { checked: true }, stopPropagation: jest.fn() } as unknown as Event;
      component['onOptionToggle']('1', event);

      expect(control.value).toEqual([]);
    });

    it('should not toggle select all when disabled', () => {
      const categories: MultiSelectCategory[] = [
        {
          categoryLabel: 'Category A',
          options: [{ value: 'a1', label: 'Option A1' }],
        },
      ];
      const control = new FormControl([]);
      componentRef.setInput('categories', categories);
      componentRef.setInput('control', control);
      componentRef.setInput('disabled', true);
      fixture.detectChanges();

      const event = { target: { checked: true }, stopPropagation: jest.fn() } as unknown as Event;
      component['onSelectAllToggle'](categories[0], event);

      expect(control.value).toEqual([]);
    });
  });

  describe('search functionality', () => {
    const mockOptions = [
      { value: '1', label: 'Apple' },
      { value: '2', label: 'Banana' },
      { value: '3', label: 'Orange' },
      { value: '4', label: 'Pineapple' },
    ];

    const mockCategories: MultiSelectCategory[] = [
      {
        categoryLabel: 'Fruits',
        options: [
          { value: 'f1', label: 'Apple' },
          { value: 'f2', label: 'Banana' },
        ],
      },
      {
        categoryLabel: 'Vegetables',
        options: [
          { value: 'v1', label: 'Carrot' },
          { value: 'v2', label: 'Broccoli' },
        ],
      },
    ];

    it('should have enableSearch default to true', () => {
      expect(component.enableSearch()).toBe(true);
    });

    it('should allow disabling search', () => {
      componentRef.setInput('enableSearch', false);
      fixture.detectChanges();

      expect(component.enableSearch()).toBe(false);
    });

    it('should update searchTerm via onSearchInput', () => {
      component['onSearchInput']('test');
      expect(component.searchTerm()).toBe('test');
    });

    it('should return all options when searchTerm is empty', () => {
      componentRef.setInput('options', mockOptions);
      fixture.detectChanges();

      expect(component['filteredOptions']()).toEqual(mockOptions);
    });

    it('should filter options by search term', () => {
      componentRef.setInput('options', mockOptions);
      fixture.detectChanges();

      component.searchTerm.set('apple');
      expect(component['filteredOptions']()).toEqual([
        { value: '1', label: 'Apple' },
        { value: '4', label: 'Pineapple' },
      ]);
    });

    it('should filter options case-insensitively', () => {
      componentRef.setInput('options', mockOptions);
      fixture.detectChanges();

      component.searchTerm.set('APPLE');
      expect(component['filteredOptions']()).toEqual([
        { value: '1', label: 'Apple' },
        { value: '4', label: 'Pineapple' },
      ]);
    });

    it('should return empty array when no options match search term', () => {
      componentRef.setInput('options', mockOptions);
      fixture.detectChanges();

      component.searchTerm.set('xyz');
      expect(component['filteredOptions']()).toEqual([]);
    });

    it('should filter all options across categories with filteredAllOptions', () => {
      componentRef.setInput('categories', mockCategories);
      fixture.detectChanges();

      component.searchTerm.set('a');
      const filtered = component['filteredAllOptions']();
      expect(filtered).toEqual([
        { value: 'f1', label: 'Apple' },
        { value: 'f2', label: 'Banana' },
        { value: 'v1', label: 'Carrot' },
      ]);
    });

    it('should return hasFilteredResults true when results exist', () => {
      componentRef.setInput('options', mockOptions);
      fixture.detectChanges();

      component.searchTerm.set('apple');
      expect(component['hasFilteredResults']()).toBe(true);
    });

    it('should return hasFilteredResults false when no results', () => {
      componentRef.setInput('options', mockOptions);
      fixture.detectChanges();

      component.searchTerm.set('xyz');
      expect(component['hasFilteredResults']()).toBe(false);
    });

    it('should filter category options with getFilteredCategoryOptions', () => {
      componentRef.setInput('categories', mockCategories);
      fixture.detectChanges();

      component.searchTerm.set('apple');
      const filtered = component['getFilteredCategoryOptions'](mockCategories[0]);
      expect(filtered).toEqual([{ value: 'f1', label: 'Apple' }]);
    });

    it('should return all category options when search term is empty', () => {
      componentRef.setInput('categories', mockCategories);
      fixture.detectChanges();

      const filtered = component['getFilteredCategoryOptions'](mockCategories[0]);
      expect(filtered).toEqual(mockCategories[0].options);
    });

    it('should return empty array when no category options match', () => {
      componentRef.setInput('categories', mockCategories);
      fixture.detectChanges();

      component.searchTerm.set('xyz');
      const filtered = component['getFilteredCategoryOptions'](mockCategories[0]);
      expect(filtered).toEqual([]);
    });

    it('should trim whitespace from search term', () => {
      componentRef.setInput('options', mockOptions);
      fixture.detectChanges();

      component.searchTerm.set('  apple  ');
      expect(component['filteredOptions']()).toEqual([
        { value: '1', label: 'Apple' },
        { value: '4', label: 'Pineapple' },
      ]);
    });
  });
});
