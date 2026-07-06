import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';

import { CrossFieldGroupDirective } from './cross-field-group.directive';
import { crossFieldValidation } from './cross-field.validators';

@Component({
  imports: [ReactiveFormsModule, CrossFieldGroupDirective],
  template: `
    <div [formGroup]="group" appCrossFieldGroup>
      <input [formControl]="group.controls.displayText" />
      <input [formControl]="group.controls.url" />
    </div>
  `,
})
class HostComponent {
  readonly group = new FormGroup({
    displayText: new FormControl('', crossFieldValidation),
    url: new FormControl('', crossFieldValidation),
  });
}

describe('CrossFieldGroupDirective', () => {
  let fixture: ComponentFixture<HostComponent>;
  let host: HostComponent;

  const dispatchInput = (): void => {
    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;

    input.dispatchEvent(new Event('input', { bubbles: true }));
    fixture.detectChanges();
  };

  beforeEach(() => {
    fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('does not touch siblings before an input event fires', () => {
    host.group.controls.displayText.setValue('Docs');

    expect(host.group.controls.url.touched).toBe(false);
  });

  it('marks empty siblings touched and invalid on input', () => {
    host.group.controls.displayText.setValue('Docs');

    dispatchInput();

    expect(host.group.controls.url.touched).toBe(true);
    expect(host.group.controls.url.errors).toEqual({ required: true });
  });

  it('clears sibling errors on input once every field is filled', () => {
    host.group.controls.displayText.setValue('Docs');
    dispatchInput();

    host.group.controls.url.setValue('https://example.com');
    dispatchInput();

    expect(host.group.controls.displayText.errors).toBeNull();
    expect(host.group.controls.url.errors).toBeNull();
  });
});
