import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DataProductUpdateDto as DataProductUpdateDtoSchema } from '@/assets/formSchemas/agridata-schemas.json';
import { AgridataStateService } from '@/entities/api/agridata-state.service';
import { DataProvidersService } from '@/entities/api/data-providers.service';
import { MasterDataService } from '@/entities/api/master-data.service';
import {
  DataProviderDto,
  DataSourceSystemDto,
  FlowCodeEnum,
  RestClientDto,
} from '@/entities/openapi';
import { I18nService } from '@/shared/i18n';
import { AuthService } from '@/shared/lib/auth';
import { buildReactiveForm } from '@/shared/lib/form.helper';
import {
  createMockAgridataStateService,
  createMockAuthService,
  createMockDataProvidersService,
  createMockI18nService,
  createMockMasterDataService,
  MockAgridataStateService,
  MockAuthService,
  MockDataProvidersService,
  MockMasterDataService,
} from '@/shared/testing/mocks';
import { createTranslocoTestingModule } from '@/shared/testing/transloco-testing.module';

import {
  dataProductFormsModel,
  FLOW_CODE_OPTIONS,
  FORM_TAB_IDS,
} from '../data-product-detail-form.model';
import { DataProductDetailTechnicalComponent } from './data-product-detail-technical.component';

const mockProvider1: DataProviderDto = {
  id: 'p1',
  uid: 'u1',
  name: { de: 'Provider 1' },
} as DataProviderDto;
const mockProvider2: DataProviderDto = {
  id: 'p2',
  uid: 'u2',
  name: { de: 'Provider 2' },
} as DataProviderDto;
const mockSystem: DataSourceSystemDto = { id: 'sys1', code: 'SYS1' } as DataSourceSystemDto;
const mockClient: RestClientDto = {
  id: 'rc1',
  code: 'CLIENT1',
  url: 'https://example.com',
  displayName: 'client 1',
} as RestClientDto;

describe('DataProductDetailTechnicalComponent', () => {
  let fixture: ComponentFixture<DataProductDetailTechnicalComponent>;
  let component: DataProductDetailTechnicalComponent;
  let authService: MockAuthService;
  let dataProvidersService: MockDataProvidersService;
  let masterDataService: MockMasterDataService;
  let stateService: MockAgridataStateService;

  const createFixture = (): ComponentFixture<DataProductDetailTechnicalComponent> => {
    const testFixture = TestBed.createComponent(DataProductDetailTechnicalComponent);
    const i18n = TestBed.inject(I18nService);
    const form = buildReactiveForm(DataProductUpdateDtoSchema, dataProductFormsModel, i18n);
    testFixture.componentRef.setInput('form', form.get(FORM_TAB_IDS.TECHNICAL_FIELDS));
    return testFixture;
  };

  beforeEach(async () => {
    authService = createMockAuthService();
    dataProvidersService = createMockDataProvidersService();
    masterDataService = createMockMasterDataService();
    stateService = createMockAgridataStateService();

    await TestBed.configureTestingModule({
      imports: [DataProductDetailTechnicalComponent, createTranslocoTestingModule()],
      providers: [
        { provide: AgridataStateService, useValue: stateService },
        { provide: AuthService, useValue: authService },
        { provide: DataProvidersService, useValue: dataProvidersService },
        { provide: I18nService, useValue: createMockI18nService() },
        { provide: MasterDataService, useValue: masterDataService },
      ],
    }).compileComponents();

    fixture = createFixture();
    component = fixture.componentInstance;

    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('flowCodeOptions', () => {
    it('should be populated with all FlowCodeEnum values', () => {
      expect(component['flowCodeOptions']).toHaveLength(Object.values(FlowCodeEnum).length);
    });

    it('should equal FLOW_CODE_OPTIONS constant', () => {
      expect(component['flowCodeOptions']).toEqual(FLOW_CODE_OPTIONS);
    });
  });

  describe('isAdmin', () => {
    it('should return false by default', () => {
      expect(component['isAdmin']()).toBe(false);
    });

    it('should reflect authService.isAdmin()', () => {
      authService.__testSignals.isAdmin.set(true);
      expect(component['isAdmin']()).toBe(true);
    });
  });

  describe('providerOptions', () => {
    it('should return empty array when no providers', () => {
      expect(component['providerOptions']()).toEqual([]);
    });

    it('should map providers to label/value options', () => {
      masterDataService.__testSignals.dataProviders.set([mockProvider1, mockProvider2]);
      const options = component['providerOptions']();
      expect(options).toHaveLength(2);
      expect(options[0]).toEqual({ label: 'Provider 1', value: 'p1' });
      expect(options[1]).toEqual({ label: 'Provider 2', value: 'p2' });
    });
  });

  describe('applyPreselectedProviderEffect', () => {
    it('should set selectedProviderId from the preselectedProviderId input', async () => {
      const testFixture = createFixture();
      testFixture.componentRef.setInput('preselectedProviderId', 'p1');
      testFixture.detectChanges();
      await testFixture.whenStable();

      expect(testFixture.componentInstance['selectedProviderId']()).toBe('p1');
    });
  });

  describe('resolveProviderEffect', () => {
    it('should not auto-select when providers list is empty', async () => {
      authService.__testSignals.isAdmin.set(false);
      masterDataService.__testSignals.dataProviders.set([]);
      fixture.detectChanges();
      await fixture.whenStable();
      expect(component['selectedProviderId']()).toBe('');
    });

    it('should not auto-select when user is admin', async () => {
      authService.__testSignals.isAdmin.set(true);
      masterDataService.__testSignals.dataProviders.set([mockProvider1]);
      fixture.detectChanges();
      await fixture.whenStable();
      expect(component['selectedProviderId']()).toBe('');
    });

    it('should not auto-select any provider when no UID matches', async () => {
      authService.__testSignals.isAdmin.set(false);
      authService.__testSignals.userInfo.set({ uid: 'no-match' });
      masterDataService.__testSignals.dataProviders.set([mockProvider1, mockProvider2]);
      fixture.detectChanges();
      await fixture.whenStable();
      expect(component['selectedProviderId']()).toBe('');
    });

    it('should not auto-select any provider when uid is undefined', async () => {
      authService.__testSignals.isAdmin.set(false);
      authService.__testSignals.userInfo.set(undefined);
      masterDataService.__testSignals.dataProviders.set([mockProvider1, mockProvider2]);
      fixture.detectChanges();
      await fixture.whenStable();
      expect(component['selectedProviderId']()).toBe('');
    });

    it('should select provider matching user uid for non-admin', async () => {
      authService.__testSignals.isAdmin.set(false);
      authService.__testSignals.userInfo.set({ uid: 'u2' });
      masterDataService.__testSignals.dataProviders.set([mockProvider1, mockProvider2]);
      fixture.detectChanges();
      await fixture.whenStable();
      expect(component['selectedProviderId']()).toBe('p2');
    });
  });

  describe('onProviderChange', () => {
    it('should update selectedProviderId', () => {
      component['onProviderChange']('p1');
      expect(component['selectedProviderId']()).toBe('p1');
    });

    it('should reset dataSourceSystemId form control', () => {
      component['getFormControl']('dataSourceSystemId').setValue('old-sys');
      component['onProviderChange']('p1');
      expect(component['getFormControl']('dataSourceSystemId').value).toBe('');
    });

    it('should reset restClientId form control', () => {
      component['getFormControl']('restClientId').setValue('old-rc');
      component['onProviderChange']('p1');
      expect(component['getFormControl']('restClientId').value).toBe('');
    });

    it('should handle null value and set empty string', () => {
      component['onProviderChange'](null);
      expect(component['selectedProviderId']()).toBe('');
    });

    it('should handle numeric value by converting to string', () => {
      component['onProviderChange'](42);
      expect(component['selectedProviderId']()).toBe('42');
    });
  });

  describe('providerDataResource', () => {
    it('should load systems and clients when provider is selected', async () => {
      dataProvidersService.getDataSourceSystems.mockResolvedValue([mockSystem]);
      dataProvidersService.getRestClients.mockResolvedValue([mockClient]);

      const testFixture = createFixture();
      testFixture.detectChanges();
      await testFixture.whenStable();

      const testComponent = testFixture.componentInstance;
      testComponent['selectedProviderId'].set('p1');
      testFixture.detectChanges();
      await testFixture.whenStable();

      expect(testComponent['dataSourceOptions']()).toEqual([{ label: 'SYS1', value: 'sys1' }]);
      expect(testComponent['restClientOptions']()).toEqual([
        { label: 'client 1 (https://example.com)', value: 'rc1' },
      ]);
    });

    it('should return empty arrays while loading', () => {
      expect(component['dataSourceOptions']()).toEqual([]);
      expect(component['restClientOptions']()).toEqual([]);
    });
  });

  describe('restClientOptions', () => {
    it('should use url as label when present', async () => {
      const clientWithUrl: RestClientDto = {
        id: 'rc2',
        url: 'https://example.com',
        displayName: 'restClient 2',
        code: 'CODE2',
      } as RestClientDto;
      dataProvidersService.getDataSourceSystems.mockResolvedValue([]);
      dataProvidersService.getRestClients.mockResolvedValue([clientWithUrl]);

      const testFixture = createFixture();
      testFixture.detectChanges();
      await testFixture.whenStable();

      testFixture.componentInstance['selectedProviderId'].set('p1');
      testFixture.detectChanges();
      await testFixture.whenStable();

      expect(testFixture.componentInstance['restClientOptions']()).toEqual([
        { label: 'restClient 2 (https://example.com)', value: 'rc2' },
      ]);
    });
  });

  describe('providerSelectHasError', () => {
    it('should return false when a provider is selected', () => {
      component['selectedProviderId'].set('p1');
      expect(component['providerSelectHasError']).toBe(false);
    });

    it('should return false when no controls are touched', () => {
      expect(component['providerSelectHasError']).toBe(false);
    });

    it('should return true when dataSourceSystemId is invalid and touched', () => {
      component['selectedProviderId'].set('');
      const ctrl = component['getFormControl']('dataSourceSystemId');
      ctrl.markAsTouched();
      ctrl.setErrors({ required: true });
      expect(component['providerSelectHasError']).toBe(true);
    });
  });

  describe('providerSelectErrorMessage', () => {
    it('should return empty string when controls are valid', () => {
      component['getFormControl']('dataSourceSystemId').setValue('sys-1');
      component['getFormControl']('restClientId').setValue('rc-1');
      expect(component['providerSelectErrorMessage']).toBe('');
    });

    it('should return error message when restClientId has errors', () => {
      // restClientId is required; with empty value it will have a required error
      const message = component['providerSelectErrorMessage'];
      expect(message).not.toBe('');
    });
  });

  describe('getFormControl', () => {
    it('should return the flowCode control', () => {
      const ctrl = component['getFormControl']('flowCode');
      expect(ctrl).toBeTruthy();
    });

    it('should return the restClientPathTemplate control', () => {
      const ctrl = component['getFormControl']('restClientPathTemplate');
      expect(ctrl).toBeTruthy();
    });

    it('should return the restClientRequestTemplate control', () => {
      const ctrl = component['getFormControl']('restClientRequestTemplate');
      expect(ctrl).toBeTruthy();
    });

    it('should return the restClientChangeDetectionPathTemplate control', () => {
      const ctrl = component['getFormControl']('restClientChangeDetectionPathTemplate');
      expect(ctrl).toBeTruthy();
    });

    it('should return the dataSourceSystemId control', () => {
      expect(component['getFormControl']('dataSourceSystemId')).toBeTruthy();
    });

    it('should return the restClientId control', () => {
      expect(component['getFormControl']('restClientId')).toBeTruthy();
    });
  });
});
