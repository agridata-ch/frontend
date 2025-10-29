import { ComponentRef } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl } from '@angular/forms';

import { AgridataMultiSelectComponent } from './agridata-multi-select.component';

describe('AgridataMultiSelectComponent', () => {
  let fixture: ComponentFixture<AgridataMultiSelectComponent>;
  let component: AgridataMultiSelectComponent;
  let componentRef: ComponentRef<AgridataMultiSelectComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [AgridataMultiSelectComponent],
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

    component.toggleDropdown();
    expect(component.isDropdownOpen()).toBe(true);

    component.toggleDropdown();
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
    component.onOptionToggle('1', event);
    expect(control.value).toEqual(['1']);
    expect(component.selectedOptions()).toEqual([{ value: '1', label: 'Option 1' }]);

    // Deselect the option
    const eventDeselect = {
      target: { checked: false },
      stopPropagation: () => {},
    } as unknown as Event;
    component.onOptionToggle('1', eventDeselect);
    expect(control.value).toEqual([]);
    expect(component.selectedOptions()).toEqual([]);
  });

  it('should correctly determine if an option is selected', () => {
    const options = [
      { value: '1', label: 'Option 1' },
      { value: '2', label: 'Option 2' },
    ];
    const control = new FormControl(['1']);

    componentRef.setInput('options', options);
    componentRef.setInput('control', control);

    expect(component.isSelected('1')).toBe(true);
    expect(component.isSelected('2')).toBe(false);
  });

  describe('click outside behavior', () => {
    it('should close the dropdown when clicking outside', () => {
      component.isDropdownOpen.set(true);
      component.handleClickOutside();
      expect(component.isDropdownOpen()).toBeFalsy();
    });
  });
});
