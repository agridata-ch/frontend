import { ComponentRef } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormGroup } from '@angular/forms';

import { I18nService } from '@/shared/i18n';
import { createMockI18nService } from '@/shared/testing/mocks';

import { DataRequestDescriptionComponent } from './data-request-description.component';

const createMockForm = () =>
  new FormGroup({
    request: new FormGroup({
      advantages: new FormControl([]),
      title: new FormGroup({
        de: new FormControl(''),
        fr: new FormControl(''),
        it: new FormControl(''),
      }),
      description: new FormGroup({
        de: new FormControl(''),
        fr: new FormControl(''),
        it: new FormControl(''),
      }),
      purpose: new FormGroup({
        de: new FormControl(''),
        fr: new FormControl(''),
        it: new FormControl(''),
      }),
    }),
  });

let fixture: ComponentFixture<DataRequestDescriptionComponent>;
let component: DataRequestDescriptionComponent;
let componentRef: ComponentRef<DataRequestDescriptionComponent>;

describe('DataRequestDescriptionComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DataRequestDescriptionComponent],
      providers: [{ provide: I18nService, useValue: createMockI18nService() }],
    }).compileComponents();

    fixture = TestBed.createComponent(DataRequestDescriptionComponent);
    component = fixture.componentInstance;
    componentRef = fixture.componentRef;
    componentRef.setInput('form', createMockForm());
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('form input', () => {
    it('should render form controls when form is provided', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.querySelector('#requestTitleDe')).toBeTruthy();
      expect(compiled.querySelector('#requestDescriptionDe')).toBeTruthy();
      expect(compiled.querySelector('#requestPurposeDe')).toBeTruthy();
    });

    it('should not render when no form is provided', () => {
      componentRef.setInput('form', undefined);
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.querySelector('#requestTitleDe')).toBeNull();
    });
  });

  describe('formDisabled input', () => {
    it('should default to false', () => {
      expect(component.formDisabled()).toBe(false);
    });

    it('should accept true value', () => {
      componentRef.setInput('formDisabled', true);
      fixture.detectChanges();

      expect(component.formDisabled()).toBe(true);
    });
  });
});
