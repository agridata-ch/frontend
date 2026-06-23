import { ComponentRef } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormGroup } from '@angular/forms';

import { environment } from '@/environments/environment';
import { I18nService } from '@/shared/i18n';
import { MockI18nService, createMockI18nService } from '@/shared/testing/mocks';

import { DataRequestFormRequestDescriptionComponent } from './data-request-form-request-description.component';
import {
  PURPOSE_PDF_FILENAMES,
  parsePurposeSublabel,
} from './data-request-form-request-description.model';

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

let fixture: ComponentFixture<DataRequestFormRequestDescriptionComponent>;
let component: DataRequestFormRequestDescriptionComponent;
let componentRef: ComponentRef<DataRequestFormRequestDescriptionComponent>;
let mockI18nService: MockI18nService;

describe('parsePurposeSublabel', () => {
  it('splits text into before, linkText and after when brackets are present', () => {
    const result = parsePurposeSublabel('Read the [guide] for details.');
    expect(result).toEqual({ before: 'Read the ', linkText: 'guide', after: ' for details.' });
  });

  it('returns full string as before and null linkText when no brackets present', () => {
    const result = parsePurposeSublabel('No link here.');
    expect(result).toEqual({ before: 'No link here.', linkText: null, after: '' });
  });

  it('returns empty after when the bracket is at the end', () => {
    const result = parsePurposeSublabel('See [here]');
    expect(result).toEqual({ before: 'See ', linkText: 'here', after: '' });
  });
});

describe('DataRequestDescriptionComponent', () => {
  beforeEach(async () => {
    mockI18nService = createMockI18nService();

    await TestBed.configureTestingModule({
      imports: [DataRequestFormRequestDescriptionComponent],
      providers: [{ provide: I18nService, useValue: mockI18nService }],
    }).compileComponents();

    fixture = TestBed.createComponent(DataRequestFormRequestDescriptionComponent);
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

  describe('pdfUrl', () => {
    it.each([
      ['de', PURPOSE_PDF_FILENAMES['de']],
      ['fr', PURPOSE_PDF_FILENAMES['fr']],
      ['it', PURPOSE_PDF_FILENAMES['it']],
    ])('returns the correct URL for lang=%s', (lang, filename) => {
      mockI18nService.lang.set(lang);

      expect(component['pdfUrl']()).toBe(`${environment.cmsMediaUrl}${filename}`);
    });

    it('falls back to the DE URL for an unrecognised lang', () => {
      mockI18nService.lang.set('es');

      expect(component['pdfUrl']()).toBe(
        `${environment.cmsMediaUrl}${PURPOSE_PDF_FILENAMES['de']}`,
      );
    });
  });

  describe('purposeSublabelParts', () => {
    it('calls translate with the purpose sublabel key', () => {
      expect(mockI18nService.translate).toHaveBeenCalledWith(
        'data-request.form.request.purpose.sublabel',
      );
    });

    it('returns parsed parts from the translated sublabel', () => {
      mockI18nService.translate.mockImplementation((key: string) =>
        key === 'data-request.form.request.purpose.sublabel' ? 'Provide details. See [here].' : key,
      );

      const testFixture = TestBed.createComponent(DataRequestFormRequestDescriptionComponent);
      testFixture.componentRef.setInput('form', createMockForm());
      testFixture.detectChanges();

      expect(testFixture.componentInstance['purposeSublabelParts']()).toEqual({
        before: 'Provide details. See ',
        linkText: 'here',
        after: '.',
      });
    });
  });
});
