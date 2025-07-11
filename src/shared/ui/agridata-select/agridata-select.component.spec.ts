import { ComponentRef } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

import { AgridataSelectComponent } from './agridata-select.component';

describe('AgridataSelectComponent', () => {
  let fixture: ComponentFixture<AgridataSelectComponent>;
  let component: AgridataSelectComponent;
  let componentRef: ComponentRef<AgridataSelectComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [AgridataSelectComponent, ReactiveFormsModule, FontAwesomeModule],
    }).compileComponents();

    fixture = TestBed.createComponent(AgridataSelectComponent);
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

  describe('click outside behavior', () => {
    it('should close the dropdown when clicking outside', () => {
      component.isDropdownOpen.set(true);
      const outside = document.createElement('div');
      component.onClickOutside(outside);
      expect(component.isDropdownOpen()).toBeFalsy();
    });

    it('should not close when clicking inside host element', () => {
      component.isDropdownOpen.set(true);
      const hostElement: HTMLElement = fixture.nativeElement;
      component.onClickOutside(hostElement);
      expect(component.isDropdownOpen()).toBeTruthy();
    });
  });

  describe('selection logic', () => {
    it('should initialize selectedOption from control value on ngOnInit', () => {
      const options = [
        { value: '1', label: 'Option 1' },
        { value: '2', label: 'Option 2' },
      ];
      componentRef.setInput('options', options);
      // Simulate control value
      componentRef.setInput('control', { value: '2', setValue: jest.fn() });
      component.ngOnInit();
      expect(component.selectedOption()).toEqual(options[1]);
    });

    it('should select an option and close dropdown', () => {
      const event = { target: { checked: true }, stopPropagation: () => {} } as unknown as Event;
      const options = [
        { value: '1', label: 'Option 1' },
        { value: '2', label: 'Option 2' },
      ];
      const setValueMock = jest.fn();
      componentRef.setInput('options', options);
      componentRef.setInput('control', { value: '', setValue: setValueMock });
      component.isDropdownOpen.set(true);
      component.onOptionSelect('2', event);
      expect(component.selectedOption()).toEqual(options[1]);
      expect(setValueMock).toHaveBeenCalledWith('2');
      expect(component.isDropdownOpen()).toBe(false);
    });

    it('isSelected should return true for selected value', () => {
      componentRef.setInput('control', { value: 'abc' });
      expect(component.isSelected('abc')).toBe(true);
      expect(component.isSelected('def')).toBe(false);
    });
  });
});
