import { ComponentRef } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AgridataToggleComponent } from './agridata-toggle.component';

describe('AgridataToggleComponent', () => {
  let component: AgridataToggleComponent;
  let fixture: ComponentFixture<AgridataToggleComponent>;
  let componentRef: ComponentRef<AgridataToggleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AgridataToggleComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AgridataToggleComponent);
    component = fixture.componentInstance;
    componentRef = fixture.componentRef;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should reflect checked state via model input', () => {
    componentRef.setInput('checked', true);
    fixture.detectChanges();
    expect(component.checked()).toBe(true);
  });

  it('should default to unchecked', () => {
    expect(component.checked()).toBe(false);
  });

  it('should disable the checkbox when disabled input is true', async () => {
    componentRef.setInput('disabled', true);
    fixture.detectChanges();
    await fixture.whenStable();
    const input: HTMLInputElement = fixture.nativeElement.querySelector('input[type="checkbox"]');
    expect(input.disabled).toBe(true);
  });

  it('should show label when provided', () => {
    componentRef.setInput('label', 'Enable notifications');
    fixture.detectChanges();
    const span: HTMLSpanElement = fixture.nativeElement.querySelector('span.text-sm');
    expect(span?.textContent?.trim()).toBe('Enable notifications');
  });

  it('should not render label element when label is empty', () => {
    fixture.detectChanges();
    const span = fixture.nativeElement.querySelector('span.text-sm');
    expect(span).toBeFalsy();
  });

  it('should set aria-label from ariaLabel input', () => {
    componentRef.setInput('ariaLabel', 'Toggle switch');
    fixture.detectChanges();
    const input: HTMLInputElement = fixture.nativeElement.querySelector('input');
    expect(input.getAttribute('aria-label')).toBe('Toggle switch');
  });

  it('should fall back to label as aria-label when ariaLabel is empty', () => {
    componentRef.setInput('label', 'My Label');
    fixture.detectChanges();
    const input: HTMLInputElement = fixture.nativeElement.querySelector('input');
    expect(input.getAttribute('aria-label')).toBe('My Label');
  });
});
