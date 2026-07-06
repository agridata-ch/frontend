import type { FormGroup } from '@angular/forms';

import { DataProductUpdateDto as DataProductUpdateDtoSchema } from '@/assets/formSchemas/agridata-schemas.json';
import { FlowCodeEnum, RestClientMethodCodeEnum } from '@/entities/openapi';
import type { I18nService } from '@/shared/i18n';
import { buildReactiveForm, getFormControl, populateFormFromDto } from '@/shared/lib/form.helper';
import { createMockI18nService } from '@/shared/testing/mocks';

import {
  buildDataProductPayload,
  dataProductFormsModel,
  FLOW_CODE_OPTIONS,
  FORM_TAB_IDS,
  METHOD_CODE_OPTIONS,
} from './data-product-detail-form.model';

const mockI18n = createMockI18nService() as unknown as I18nService;

function buildForm(): FormGroup {
  return buildReactiveForm(DataProductUpdateDtoSchema, dataProductFormsModel, mockI18n);
}

describe('data-product-detail-form.model', () => {
  describe('FLOW_CODE_OPTIONS', () => {
    it('should contain all FlowCodeEnum values', () => {
      const allValues = Object.values(FlowCodeEnum);
      expect(FLOW_CODE_OPTIONS).toHaveLength(allValues.length);
      expect(FLOW_CODE_OPTIONS.map((o) => o.value)).toEqual(expect.arrayContaining(allValues));
    });

    it('should be sorted alphabetically', () => {
      const sorted = [...FLOW_CODE_OPTIONS].sort((a, b) =>
        String(a.label).localeCompare(String(b.label)),
      );
      expect(FLOW_CODE_OPTIONS).toEqual(sorted);
    });

    it('should have matching label and value', () => {
      FLOW_CODE_OPTIONS.forEach((option) => {
        expect(option.label).toBe(option.value);
      });
    });
  });

  describe('METHOD_CODE_OPTIONS', () => {
    it('should contain all RestClientMethodCodeEnum values', () => {
      const allValues = Object.values(RestClientMethodCodeEnum);
      expect(METHOD_CODE_OPTIONS).toHaveLength(allValues.length);
      expect(METHOD_CODE_OPTIONS.map((o) => o.value)).toEqual(expect.arrayContaining(allValues));
    });

    it('should be sorted alphabetically', () => {
      const sorted = [...METHOD_CODE_OPTIONS].sort((a, b) =>
        String(a.label).localeCompare(String(b.label)),
      );
      expect(METHOD_CODE_OPTIONS).toEqual(sorted);
    });

    it('should have matching label and value', () => {
      METHOD_CODE_OPTIONS.forEach((option) => {
        expect(option.label).toBe(option.value);
      });
    });
  });

  describe('buildDataProductPayload', () => {
    it('should convert empty string flowCode to null', () => {
      const form = buildForm();
      getFormControl(form.get(FORM_TAB_IDS.TECHNICAL_FIELDS) as FormGroup, 'flowCode').setValue('');
      const payload = buildDataProductPayload(form);
      expect(payload['flowCode']).toBeNull();
    });

    it('should convert empty string restClientMethodCode to null', () => {
      const form = buildForm();
      getFormControl(
        form.get(FORM_TAB_IDS.TECHNICAL_FIELDS) as FormGroup,
        'restClientMethodCode',
      ).setValue('');
      const payload = buildDataProductPayload(form);
      expect(payload['restClientMethodCode']).toBeNull();
    });

    it('should keep non-empty flowCode value intact', () => {
      const form = buildForm();
      getFormControl(form.get(FORM_TAB_IDS.TECHNICAL_FIELDS) as FormGroup, 'flowCode').setValue(
        FlowCodeEnum.UidBasedPreValidation,
      );
      const payload = buildDataProductPayload(form);
      expect(payload['flowCode']).toBe(FlowCodeEnum.UidBasedPreValidation);
    });

    it('should keep non-empty restClientMethodCode value intact', () => {
      const form = buildForm();
      getFormControl(
        form.get(FORM_TAB_IDS.TECHNICAL_FIELDS) as FormGroup,
        'restClientMethodCode',
      ).setValue(RestClientMethodCodeEnum.Post);
      const payload = buildDataProductPayload(form);
      expect(payload['restClientMethodCode']).toBe(RestClientMethodCodeEnum.Post);
    });

    it('should flatten nested tab groups into a top-level payload', () => {
      const form = buildForm();
      getFormControl(
        form.get(FORM_TAB_IDS.TECHNICAL_FIELDS) as FormGroup,
        'dataSourceSystemId',
      ).setValue('sys-1');
      const payload = buildDataProductPayload(form);
      expect(payload).toHaveProperty('dataSourceSystemId', 'sys-1');
    });

    it('should include name fields as a nested object at the top level', () => {
      const form = buildForm();
      getFormControl(
        form.get(`${FORM_TAB_IDS.NAME_AND_DESCRIPTION}.name`) as FormGroup,
        'de',
      ).setValue('Test DE');
      const payload = buildDataProductPayload(form);
      expect((payload['name'] as Record<string, string>)?.['de']).toBe('Test DE');
    });

    it('should drop empty and whitespace-only link rows before save', () => {
      const form = buildForm();
      populateFormFromDto(
        form,
        {
          links: [
            { displayText: 'Docs', url: 'https://example.com' },
            { displayText: '', url: '' },
            { displayText: '  ', url: '  ' },
          ],
        },
        dataProductFormsModel,
      );

      const payload = buildDataProductPayload(form);

      expect(payload['links']).toEqual([{ displayText: 'Docs', url: 'https://example.com' }]);
    });
  });
});
