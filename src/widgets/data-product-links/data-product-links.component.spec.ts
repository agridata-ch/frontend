import { ComponentRef } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormGroup } from '@angular/forms';

import { LinkDto } from '@/entities/openapi';
import { revalidateCrossFieldGroup } from '@/shared/forms/cross-field.validators';
import { I18nService } from '@/shared/i18n';
import {
  buildReactiveForm,
  FORM_COMPLETION_STRATEGIES,
  FormArrayWithMessages,
  FormModel,
  getFormArray,
  JsonSchema,
  populateFormFromDto,
} from '@/shared/lib/form.helper';
import { createMockI18nService } from '@/shared/testing/mocks';

import { DataProductLinksComponent, MAX_LINKS } from '.';

const linksSchema: JsonSchema = {
  type: 'object',
  properties: {
    links: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          displayText: { type: 'string', minLength: 1, maxLength: 255 },
          url: { type: 'string', minLength: 1, maxLength: 2048 },
        },
      },
      minItems: 0,
      maxItems: 5,
    },
  },
};

const formsModel: FormModel[] = [
  {
    completionStrategy: FORM_COMPLETION_STRATEGIES.FORM_VALIDATION,
    fields: [{ name: 'links', asFormArray: true }],
  },
];

const createMockForm = (initial: LinkDto[] = []) => {
  const form = buildReactiveForm(
    linksSchema,
    formsModel,
    createMockI18nService() as unknown as I18nService,
  );

  if (initial.length > 0) {
    populateFormFromDto(form, { links: initial }, formsModel);
  }

  return {
    form,
    links: getFormArray(form, 'links'),
  };
};

const setRow = (links: FormArrayWithMessages, index: number, value: Partial<LinkDto>): void => {
  const group = links.at(index);

  if (value.displayText !== undefined) {
    group.get('displayText')?.setValue(value.displayText);
  }

  if (value.url !== undefined) {
    group.get('url')?.setValue(value.url);
  }

  revalidateCrossFieldGroup(group);
};

describe('DataProductLinksComponent', () => {
  let component: DataProductLinksComponent;
  let componentRef: ComponentRef<DataProductLinksComponent>;
  let fixture: ComponentFixture<DataProductLinksComponent>;
  let form: FormGroup;
  let links: FormArrayWithMessages;

  const createComponent = async (initial: LinkDto[] = []): Promise<void> => {
    const mock = createMockForm(initial);

    form = mock.form;
    links = mock.links;

    fixture = TestBed.createComponent(DataProductLinksComponent);
    component = fixture.componentInstance;
    componentRef = fixture.componentRef;

    componentRef.setInput('form', form);
    fixture.detectChanges();

    await fixture.whenStable();
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DataProductLinksComponent],
      providers: [{ provide: I18nService, useValue: createMockI18nService() }],
    }).compileComponents();

    await createComponent();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('addLink', () => {
    it('should append a schema-generated and initialized link group', () => {
      component['addLink']();

      const row = links.at(0);

      expect(links).toHaveLength(1);
      expect(row.get('displayText')).toBeTruthy();
      expect(row.get('url')).toBeTruthy();

      setRow(links, 0, { displayText: 'Docs' });

      expect(row.get('url')?.errors).toEqual({ required: true });
    });

    it('should not add more than the maximum number of links', () => {
      for (let index = 0; index < MAX_LINKS + 1; index++) {
        component['addLink']();
      }

      expect(links).toHaveLength(MAX_LINKS);
    });
  });

  describe('removeLink', () => {
    it('should remove the link at the given index', () => {
      component['addLink']();
      component['addLink']();

      component['removeLink'](0);

      expect(links).toHaveLength(1);
    });
  });

  describe('row validation', () => {
    beforeEach(() => {
      component['addLink']();
    });

    it('should require url when only displayText is filled', () => {
      setRow(links, 0, { displayText: 'Docs' });

      expect(links.valid).toBe(false);
      expect(links.at(0).get('displayText')?.errors).toBeNull();
      expect(links.at(0).get('url')?.errors).toEqual({ required: true });
    });

    it('should reject non-absolute URLs', () => {
      setRow(links, 0, { displayText: 'Docs', url: 'example.com' });

      expect(links.valid).toBe(false);
      expect(links.at(0).get('url')?.errors).toEqual({ absoluteUrl: true });
    });

    it('should accept a complete valid row', () => {
      setRow(links, 0, {
        displayText: 'Docs',
        url: 'https://example.com',
      });

      expect(links.valid).toBe(true);
    });
  });

  describe('initial rows', () => {
    it('should use rows populated before component init', async () => {
      await createComponent([
        { displayText: 'Docs', url: 'https://example.com' },
        { displayText: 'API', url: 'https://api.example.com' },
      ]);

      expect(component['linkGroups']()).toHaveLength(2);
      expect(links.at(0).get('displayText')?.value).toBe('Docs');
      expect(links.at(1).get('url')?.value).toBe('https://api.example.com');
    });
  });

  describe('async hydrated rows', () => {
    beforeEach(async () => {
      await createComponent();

      populateFormFromDto(
        form,
        {
          links: [{ displayText: 'Docs', url: 'https://example.com' }],
        },
        formsModel,
      );

      fixture.detectChanges();

      await fixture.whenStable();
    });

    it('should initialize rows hydrated after component init', () => {
      expect(component['linkGroups']()).toHaveLength(1);

      setRow(links, 0, { url: '' });

      expect(links.at(0).get('url')?.errors).toEqual({ required: true });
    });
  });

  describe('empty state', () => {
    it('should show the empty placeholder in view mode when there are no links', async () => {
      componentRef.setInput('formDisabled', true);
      fixture.detectChanges();
      await fixture.whenStable();

      expect(fixture.nativeElement.querySelector('span.italic')).toBeTruthy();
    });
  });

  describe('viewLinks', () => {
    it('should recompute after async hydration even when read while empty first', async () => {
      await createComponent();

      // Mirror the view-mode template reading viewLinks before the DTO resolves; the computed
      // must not stay memoized empty once the FormArray is hydrated asynchronously.
      expect(component['viewLinks']()).toEqual([]);

      populateFormFromDto(
        form,
        { links: [{ displayText: 'Docs', url: 'https://example.com' }] },
        formsModel,
      );

      fixture.detectChanges();
      await fixture.whenStable();

      expect(component['viewLinks']()).toEqual([
        { displayText: 'Docs', url: 'https://example.com' },
      ]);
    });

    it('should drop rows where either field is empty', async () => {
      await createComponent([
        { displayText: 'Docs', url: 'https://example.com' },
        { displayText: 'No url', url: '' },
        { displayText: '', url: 'https://orphan.example.com' },
      ]);

      expect(component['viewLinks']()).toEqual([
        { displayText: 'Docs', url: 'https://example.com' },
      ]);
    });

    it('should keep duplicate rows that share the same display text and url', async () => {
      await createComponent([
        { displayText: 'Docs', url: 'https://example.com' },
        { displayText: 'Docs', url: 'https://example.com' },
      ]);

      expect(component['viewLinks']()).toHaveLength(2);
    });
  });
});
