import { ComponentRef } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormGroup } from '@angular/forms';

import { DataRequestAdvantageDto } from '@/entities/openapi';
import { revalidateCrossFieldGroup } from '@/shared/forms/cross-field.validators';
import { I18nService } from '@/shared/i18n';
import { createMockI18nService } from '@/shared/testing/mocks';

import { DataRequestFormRequestAdvantagesComponent, MAX_ADVANTAGES } from '.';

const createMockForm = (initial: DataRequestAdvantageDto[] = []) => {
  const advantages = new FormControl<DataRequestAdvantageDto[]>(initial, { nonNullable: true });
  const form = new FormGroup({ request: new FormGroup({ advantages }) });
  return { form, advantages };
};

let fixture: ComponentFixture<DataRequestFormRequestAdvantagesComponent>;
let component: DataRequestFormRequestAdvantagesComponent;
let componentRef: ComponentRef<DataRequestFormRequestAdvantagesComponent>;
let advantagesControl: FormControl<DataRequestAdvantageDto[]>;

describe('DataRequestAdvantagesComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DataRequestFormRequestAdvantagesComponent],
      providers: [{ provide: I18nService, useValue: createMockI18nService() }],
    }).compileComponents();

    fixture = TestBed.createComponent(DataRequestFormRequestAdvantagesComponent);
    component = fixture.componentInstance;
    componentRef = fixture.componentRef;
    const mock = createMockForm();
    advantagesControl = mock.advantages;
    componentRef.setInput('form', mock.form);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('addAdvantage', () => {
    it('should append a new advantage group', () => {
      component['addAdvantage']();

      expect(component['advantagesArray']).toHaveLength(2);
    });

    it('should sync the new advantage to the outer control', () => {
      component['addAdvantage']();

      expect(advantagesControl.value).toEqual([]);
    });

    it('should not add when at max capacity', () => {
      for (let i = 0; i < MAX_ADVANTAGES; i++) {
        component['addAdvantage']();
      }
      component['addAdvantage']();

      expect(component['advantagesArray']).toHaveLength(MAX_ADVANTAGES);
    });
  });

  describe('removeAdvantage', () => {
    it('should remove the advantage at the given index', () => {
      component['addAdvantage']();
      component['addAdvantage']();

      component['removeAdvantage'](0);

      expect(component['advantagesArray']).toHaveLength(2);
    });

    it('should sync the updated list to the outer control', () => {
      component['addAdvantage']();
      component['addAdvantage']();

      component['removeAdvantage'](0);

      expect(advantagesControl.value).toHaveLength(0);
    });
  });

  describe('canAdd', () => {
    it('should be true when below max capacity', () => {
      expect(component['canAdd']()).toBe(true);
    });

    it('should be false when at max capacity', () => {
      for (let i = 0; i < MAX_ADVANTAGES; i++) {
        component['addAdvantage']();
      }

      expect(component['canAdd']()).toBe(false);
    });
  });

  describe('syncToControl', () => {
    it('should mark the advantages control as dirty', () => {
      component['advantageGroup'](0).get('de')?.setValue('Vorteil');

      component['syncToControl']();

      expect(advantagesControl.dirty).toBe(true);
    });

    it('should write current advantages array to the outer control', () => {
      component['addAdvantage']();
      component['advantageGroup'](0).get('de')?.setValue('Vorteil 1 Text');

      component['syncToControl']();

      expect(advantagesControl.value?.[0]?.de).toBe('Vorteil 1 Text');
    });

    it('should filter out advantages where all fields are empty', () => {
      component['addAdvantage']();

      component['syncToControl']();

      expect(advantagesControl.value).toEqual([]);
    });

    it('should keep advantages where at least one field is non-empty', () => {
      component['advantageGroup'](0).get('fr')?.setValue('Avantage');

      component['syncToControl']();

      expect(advantagesControl.value?.length).toBe(1);
    });

    it('should drop advantages whose only content is whitespace', () => {
      component['advantageGroup'](0).get('de')?.setValue('   ');

      component['syncToControl']();

      expect(advantagesControl.value).toEqual([]);
      expect(advantagesControl.valid).toBe(true);
    });
  });

  describe('validateAdvantages', () => {
    it('should be valid when advantages array is empty', () => {
      component['syncToControl']();

      expect(advantagesControl.valid).toBe(true);
    });

    it('should be invalid when a filled field has fewer than 5 chars', () => {
      component['advantageGroup'](0).get('de')?.setValue('abc');

      component['syncToControl']();

      expect(advantagesControl.valid).toBe(false);
      expect(advantagesControl.errors).toEqual({ advantagesInvalid: true });
    });

    it('should be invalid when only one language is filled even if it meets minimum length', () => {
      component['advantageGroup'](0).get('de')?.setValue('Vorteil');

      component['syncToControl']();

      expect(advantagesControl.valid).toBe(false);
      expect(advantagesControl.errors).toEqual({ advantagesInvalid: true });
    });

    it('should be invalid when all three are filled but one is shorter than 5 chars', () => {
      component['advantageGroup'](0).get('de')?.setValue('abc');
      component['advantageGroup'](0).get('fr')?.setValue('Avantage valide');
      component['advantageGroup'](0).get('it')?.setValue('Vantaggio valido');

      component['syncToControl']();

      expect(advantagesControl.valid).toBe(false);
      expect(advantagesControl.errors).toEqual({ advantagesInvalid: true });
    });

    it('should be valid when all three languages are filled and each has 5 or more chars', () => {
      component['advantageGroup'](0).get('de')?.setValue('Vorteil');
      component['advantageGroup'](0).get('fr')?.setValue('Avantage');
      component['advantageGroup'](0).get('it')?.setValue('Vantaggio');

      component['syncToControl']();

      expect(advantagesControl.valid).toBe(true);
    });
  });

  describe('cross-language errors', () => {
    // CrossFieldGroupDirective revalidates the group on input via revalidateCrossFieldGroup;
    // the tests call that helper directly to mirror the on-input path.
    const revalidate = () => revalidateCrossFieldGroup(component['advantageGroup'](0));

    it('should set required error on empty sibling fields when one language is filled', () => {
      component['advantageGroup'](0).get('de')?.setValue('Vorteil');

      revalidate();

      expect(component['advantageGroup'](0).get('fr')?.errors).toEqual({ required: true });
      expect(component['advantageGroup'](0).get('it')?.errors).toEqual({ required: true });
    });

    it('should mark empty sibling fields as touched when one language is filled', () => {
      component['advantageGroup'](0).get('de')?.setValue('Vorteil');

      revalidate();

      expect(component['advantageGroup'](0).get('fr')?.touched).toBe(true);
      expect(component['advantageGroup'](0).get('it')?.touched).toBe(true);
    });

    it('should clear required error on sibling once all languages are filled', () => {
      component['advantageGroup'](0).get('de')?.setValue('Vorteil');
      revalidate();

      component['advantageGroup'](0).get('fr')?.setValue('Avantage');
      component['advantageGroup'](0).get('it')?.setValue('Vantaggio');
      revalidate();

      expect(component['advantageGroup'](0).get('fr')?.errors).toBeNull();
      expect(component['advantageGroup'](0).get('it')?.errors).toBeNull();
    });

    it('should clear all cross-language errors when all fields are emptied', () => {
      component['advantageGroup'](0).get('de')?.setValue('Vorteil');
      revalidate();

      component['advantageGroup'](0).get('de')?.setValue('');
      revalidate();

      expect(component['advantageGroup'](0).get('fr')?.errors).toBeNull();
      expect(component['advantageGroup'](0).get('it')?.errors).toBeNull();
    });
  });

  describe('init from existing control value', () => {
    it('should populate FormArray from control value on init', async () => {
      const existingAdvantages: DataRequestAdvantageDto[] = [
        { de: 'Vorteil 1', fr: 'Avantage 1', it: 'Vantaggio 1' },
        { de: 'Vorteil 2', fr: 'Avantage 2', it: 'Vantaggio 2' },
      ];
      const { form: preloadedForm } = createMockForm(existingAdvantages);

      const newFixture = TestBed.createComponent(DataRequestFormRequestAdvantagesComponent);
      newFixture.componentRef.setInput('form', preloadedForm);
      newFixture.detectChanges();
      await newFixture.whenStable();

      expect(newFixture.componentInstance['advantagesArray']).toHaveLength(2);
      expect(newFixture.componentInstance['advantageGroup'](0).get('de')?.value).toBe('Vorteil 1');
      expect(newFixture.componentInstance['advantageGroup'](1).get('fr')?.value).toBe('Avantage 2');
    });

    it('should set required errors on empty sibling fields when loaded with partial advantages', async () => {
      const partialAdvantages: DataRequestAdvantageDto[] = [{ de: 'Vorteil 1', fr: '', it: '' }];
      const { form: preloadedForm } = createMockForm(partialAdvantages);

      const newFixture = TestBed.createComponent(DataRequestFormRequestAdvantagesComponent);
      newFixture.componentRef.setInput('form', preloadedForm);
      newFixture.detectChanges();
      await newFixture.whenStable();

      const comp = newFixture.componentInstance;
      expect(comp['advantageGroup'](0).get('fr')?.errors).toEqual({ required: true });
      expect(comp['advantageGroup'](0).get('it')?.errors).toEqual({ required: true });
      expect(comp['advantageGroup'](0).get('fr')?.touched).toBe(true);
    });
  });
});
