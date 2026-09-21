import { ComponentRef } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

import { AgridataSelectComponent } from './agridata-select.component';

describe('AgridataSelectComponent', () => {
  let fixture: ComponentFixture<AgridataSelectComponent>;
  let component: AgridataSelectComponent;
  let componentRef: ComponentRef<AgridataSelectComponent>;
  let openComponent: any;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [AgridataSelectComponent, ReactiveFormsModule, FontAwesomeModule],
    }).compileComponents();

    fixture = TestBed.createComponent(AgridataSelectComponent);
    component = fixture.componentInstance;
    componentRef = fixture.componentRef;
    openComponent = component as any;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should toggle the dropdown open and closed', () => {
    expect(openComponent.isDropdownOpen()).toBe(false);
    expect(openComponent.dropdownIcon()).toBe(openComponent.chevronDown);

    openComponent.toggleDropdown();
    expect(openComponent.isDropdownOpen()).toBe(true);
    expect(openComponent.dropdownIcon()).toBe(openComponent.chevronUp);

    openComponent.toggleDropdown();
    expect(openComponent.isDropdownOpen()).toBe(false);
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

  describe('selection logic', () => {
    it('should initialize selectedOption from control value on ngOnInit', () => {
      const options = [
        { value: '1', label: 'Option 1' },
        { value: '2', label: 'Option 2' },
      ];
      componentRef.setInput('options', options);
      // Simulate control value
      componentRef.setInput('control', { value: '2', setValue: vi.fn() });
      fixture.detectChanges();
      expect(component.selectedOption()).toEqual(options[1].value);
    });

    it('should select an option and close dropdown', () => {
      const event = {
        target: { checked: true },
        stopPropagation: () => {},
      } as unknown as Event;
      const options = [
        { value: '1', label: 'Option 1' },
        { value: '2', label: 'Option 2' },
      ];
      const setValueMock = vi.fn();
      componentRef.setInput('options', options);
      componentRef.setInput('control', { value: '', setValue: setValueMock });
      openComponent.isDropdownOpen.set(true);
      openComponent.handleOptionSelect('2', event);
      expect(openComponent.selectedOption()).toEqual(options[1].value);
      expect(setValueMock).toHaveBeenCalledWith('2');
      expect(openComponent.isDropdownOpen()).toBe(false);
    });

    it('isSelected should return true for selected value', () => {
      componentRef.setInput('control', { value: 'abc' });
      fixture.detectChanges();
      expect(component.isSelected('abc')).toBe(true);
      expect(component.isSelected('def')).toBe(false);
    });
  });

  describe('grouped options', () => {
    const groups = [
      { label: 'Provider A', options: [{ value: 'a1', label: 'System A1' }] },
      { label: 'Provider B', options: [{ value: 'b1', label: 'System B1' }] },
    ];

    it('resolves the selected label from a grouped option', () => {
      componentRef.setInput('groups', groups);
      component.selectedOption.set('b1');
      fixture.detectChanges();

      expect(component.getSelectedOptionLabel()).toBe('System B1');
    });

    it('renders group headers and their options when opened', () => {
      componentRef.setInput('groups', groups);
      openComponent.isDropdownOpen.set(true);
      fixture.detectChanges();

      const text = fixture.nativeElement.textContent;
      expect(text).toContain('Provider A');
      expect(text).toContain('System A1');
      expect(text).toContain('System B1');
    });

    it('selects a grouped option', () => {
      const event = { stopPropagation: () => {} } as unknown as Event;
      componentRef.setInput('groups', groups);
      openComponent.handleOptionSelect('a1', event);

      expect(component.selectedOption()).toBe('a1');
    });
  });

  describe('click outside behavior', () => {
    it('should close the dropdown when clicking outside', () => {
      openComponent.isDropdownOpen.set(true);
      openComponent.handleClickOutside();
      expect(openComponent.isDropdownOpen()).toBeFalsy();
    });
  });
});
