import { Location } from '@angular/common';
import { ComponentRef } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AbstractControl } from '@angular/forms';
import { provideRouter, Router } from '@angular/router';

import { AgridataStateService } from '@/entities/api/agridata-state.service';
import { DataProductDocumentService } from '@/entities/api/data-product-document.service';
import { DataProductService } from '@/entities/api/data-product.service';
import { DataProvidersService } from '@/entities/api/data-providers.service';
import { MasterDataService } from '@/entities/api/master-data.service';
import { DataProductDto } from '@/entities/openapi';
import { I18nService } from '@/shared/i18n';
import { AuthService } from '@/shared/lib/auth';
import {
  createMockAgridataStateService,
  createMockAuthService,
  createMockDataProductDocumentService,
  createMockDataProductService,
  createMockDataProvidersService,
  createMockI18nService,
  createMockMasterDataService,
  createMockToastService,
  MockAgridataStateService,
  MockDataProductService,
  MockToastService,
} from '@/shared/testing/mocks';
import { createTranslocoTestingModule } from '@/shared/testing/transloco-testing.module';
import { ToastService, ToastType } from '@/shared/toast';

import { DataProductDetailFormComponent } from './data-product-detail-form.component';
import {
  DATA_PRODUCT_NEW_ID,
  FORCE_RELOAD_DATA_PRODUCTS_STATE_PARAM,
  FORM_TAB_IDS,
} from './data-product-detail-form.model';

function fillValidForm(component: DataProductDetailFormComponent): void {
  component['form'].patchValue({
    [FORM_TAB_IDS.NAME_AND_DESCRIPTION]: {
      name: { de: 'Test DE', fr: 'Test FR', it: 'Test IT' },
      description: {
        de: 'Description DE',
        fr: 'Description FR',
        it: 'Description IT',
      },
      extendedDescription: {
        de: 'Extended DE',
        fr: 'Extended FR',
        it: 'Extended IT',
      },
    },
    [FORM_TAB_IDS.TECHNICAL_FIELDS]: {
      dataSourceSystemId: 'sys-1',
      restClientId: 'rc-1',
      restClientMethodCode: 'GET',
      flowCode: 'UID_BASED_PRE_VALIDATION',
      restClientPathTemplate: '/api/path',
      restClientRequestTemplate: '{}',
    },
  });
}

describe('DataProductDetailFormComponent', () => {
  let fixture: ComponentFixture<DataProductDetailFormComponent>;
  let component: DataProductDetailFormComponent;
  let componentRef: ComponentRef<DataProductDetailFormComponent>;
  let dataProductService: MockDataProductService;
  let stateService: MockAgridataStateService;
  let toastService: MockToastService;
  let router: Router;

  beforeEach(async () => {
    dataProductService = createMockDataProductService();
    stateService = createMockAgridataStateService();
    toastService = createMockToastService();

    await TestBed.configureTestingModule({
      imports: [DataProductDetailFormComponent, createTranslocoTestingModule()],
      providers: [
        { provide: AgridataStateService, useValue: stateService },
        { provide: AuthService, useValue: createMockAuthService() },
        { provide: DataProductDocumentService, useValue: createMockDataProductDocumentService() },
        { provide: DataProductService, useValue: dataProductService },
        { provide: DataProvidersService, useValue: createMockDataProvidersService() },
        { provide: I18nService, useValue: createMockI18nService() },
        { provide: MasterDataService, useValue: createMockMasterDataService() },
        { provide: ToastService, useValue: toastService },
        provideRouter([{ path: '**', component: DataProductDetailFormComponent }]),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DataProductDetailFormComponent);
    component = fixture.componentInstance;
    componentRef = fixture.componentRef;
    router = TestBed.inject(Router);

    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('isOpen', () => {
    it('should be true after initial render', () => {
      expect(component['isOpen']()).toBe(true);
    });
  });

  describe('tabs', () => {
    it('should return three tabs', () => {
      expect(component['tabs']()).toHaveLength(3);
    });

    it('should have correct tab IDs', () => {
      const ids = component['tabs']().map((t) => t.id);
      expect(ids).toContain(FORM_TAB_IDS.NAME_AND_DESCRIPTION);
      expect(ids).toContain(FORM_TAB_IDS.TECHNICAL_FIELDS);
      expect(ids).toContain(FORM_TAB_IDS.LINKS_DOCUMENTS);
    });

    it('should have hasError=false on all tabs before publish is attempted', () => {
      expect(component['tabs']().every((t) => !t.hasError)).toBe(true);
    });

    it('should set hasError=true on invalid tabs after publish attempt', async () => {
      // nameAndDescription tab has required fields (dataSourceSystemId)
      // so triggering saveAndPublish without filling them should mark tab as having errors
      await component['saveAndPublish']();
      fixture.detectChanges();
      await fixture.whenStable();

      const nameTab = component['tabs']().find((t) => t.id === FORM_TAB_IDS.NAME_AND_DESCRIPTION);
      expect(nameTab?.hasError).toBe(true);
    });

    it('should not redden the documents tab while a scan is only pending', () => {
      component['publishAttempted'].set(true);
      jest.spyOn(component['uploadStore'], 'hasBlockingState').mockReturnValue(false);

      const documentsTab = component['tabs']().find((t) => t.id === FORM_TAB_IDS.LINKS_DOCUMENTS);
      expect(documentsTab?.hasError).toBe(false);
    });

    it('should redden the documents tab when a document has failed', () => {
      component['publishAttempted'].set(true);
      jest.spyOn(component['uploadStore'], 'hasBlockingState').mockReturnValue(true);

      const documentsTab = component['tabs']().find((t) => t.id === FORM_TAB_IDS.LINKS_DOCUMENTS);
      expect(documentsTab?.hasError).toBe(true);
    });
  });

  describe('scrollToFirstError', () => {
    it('activates the links & documents tab when it is the first invalid tab', () => {
      jest.spyOn(component['form'], 'get').mockImplementation(
        (path) =>
          ({
            invalid: path === FORM_TAB_IDS.LINKS_DOCUMENTS,
          }) as unknown as AbstractControl,
      );

      component['scrollToFirstError']();

      expect(component['activeTabId']()).toBe(FORM_TAB_IDS.LINKS_DOCUMENTS);
    });
  });

  describe('getTabForm', () => {
    it('should return a FormGroup for NAME_AND_DESCRIPTION', () => {
      const tabForm = component['getTabForm'](FORM_TAB_IDS.NAME_AND_DESCRIPTION);
      expect(tabForm).toBeTruthy();
      expect(tabForm.controls).toBeDefined();
    });

    it('should return a FormGroup for TECHNICAL_FIELDS', () => {
      const tabForm = component['getTabForm'](FORM_TAB_IDS.TECHNICAL_FIELDS);
      expect(tabForm).toBeTruthy();
      expect(tabForm.controls).toBeDefined();
    });
  });

  describe('syncRouteIdEffect', () => {
    it('should set currentDataProductId when dataProductId is a real id', async () => {
      componentRef.setInput('dataProductId', 'abc-123');
      fixture.detectChanges();
      await fixture.whenStable();
      expect(component['currentDataProductId']()).toBe('abc-123');
    });

    it('should not set currentDataProductId when dataProductId is "new"', async () => {
      componentRef.setInput('dataProductId', DATA_PRODUCT_NEW_ID);
      fixture.detectChanges();
      await fixture.whenStable();
      expect(component['currentDataProductId']()).toBeNull();
    });

    it('should not set currentDataProductId when dataProductId is undefined', async () => {
      componentRef.setInput('dataProductId', undefined);
      fixture.detectChanges();
      await fixture.whenStable();
      expect(component['currentDataProductId']()).toBeNull();
    });
  });

  describe('cancel', () => {
    it('should navigate to data-products list with refresh=false by default', () => {
      const navigateSpy = jest.spyOn(router, 'navigate');
      component['cancel']();
      expect(navigateSpy).toHaveBeenCalledWith(['data-products'], {
        state: { [FORCE_RELOAD_DATA_PRODUCTS_STATE_PARAM]: false },
      });
    });

    it('should navigate with refresh=true when refreshListNeeded is set', () => {
      const navigateSpy = jest.spyOn(router, 'navigate');
      component['refreshListNeeded'].set(true);
      component['cancel']();
      expect(navigateSpy).toHaveBeenCalledWith(['data-products'], {
        state: { [FORCE_RELOAD_DATA_PRODUCTS_STATE_PARAM]: true },
      });
    });
  });

  describe('enterEditMode', () => {
    it('should set isEditMode to true', () => {
      component['enterEditMode']();
      expect(component['isEditMode']()).toBe(true);
    });

    it('should exit edit mode on cancel without navigating', () => {
      const navigateSpy = jest.spyOn(router, 'navigate');
      component['enterEditMode']();

      component['cancel']();

      expect(component['isEditMode']()).toBe(false);
      expect(navigateSpy).not.toHaveBeenCalled();
    });

    it('should reset publishAttempted when cancelling out of edit mode', () => {
      component['publishAttempted'].set(true);
      component['enterEditMode']();

      component['cancel']();

      expect(component['publishAttempted']()).toBe(false);
    });
  });

  describe('syncDisabledFieldsEffect', () => {
    it('should keep name/description editable but lock dataSourceSystemId in edit mode as admin', async () => {
      stateService.__testSignals.actingRole.set('ADMIN');
      component['enterEditMode']();
      fixture.detectChanges();
      await fixture.whenStable();

      const info = component['getTabForm'](FORM_TAB_IDS.NAME_AND_DESCRIPTION);
      const technical = component['getTabForm'](FORM_TAB_IDS.TECHNICAL_FIELDS);
      expect(info.get('name')?.enabled).toBe(true);
      expect(info.get('description')?.enabled).toBe(true);
      expect(technical.get('dataSourceSystemId')?.disabled).toBe(true);
      expect(technical.get('restClientId')?.enabled).toBe(true);
    });

    it('should disable the locked fields when entering edit mode as provider', async () => {
      stateService.__testSignals.actingRole.set('PROVIDER');
      component['enterEditMode']();
      fixture.detectChanges();
      await fixture.whenStable();

      const info = component['getTabForm'](FORM_TAB_IDS.NAME_AND_DESCRIPTION);
      const technical = component['getTabForm'](FORM_TAB_IDS.TECHNICAL_FIELDS);
      expect(info.get('name')?.disabled).toBe(true);
      expect(info.get('description')?.disabled).toBe(true);
      expect(technical.get('dataSourceSystemId')?.disabled).toBe(true);
    });

    it('should render the nested name input disabled in edit mode as provider (full path)', async () => {
      stateService.__testSignals.actingRole.set('PROVIDER');
      component['enterEditMode']();
      fixture.detectChanges();
      await fixture.whenStable();

      const nameInput = fixture.nativeElement.querySelector('#name-de') as HTMLInputElement | null;
      expect(nameInput).toBeTruthy();
      expect(nameInput?.disabled).toBe(true);
      expect(nameInput?.classList.contains('bg-gray-100')).toBe(true);
    });

    it('should re-enable the locked fields when leaving edit mode', async () => {
      stateService.__testSignals.actingRole.set('ADMIN');
      component['enterEditMode']();
      fixture.detectChanges();
      await fixture.whenStable();

      component['cancel']();
      fixture.detectChanges();
      await fixture.whenStable();

      const info = component['getTabForm'](FORM_TAB_IDS.NAME_AND_DESCRIPTION);
      const technical = component['getTabForm'](FORM_TAB_IDS.TECHNICAL_FIELDS);
      expect(info.get('name')?.enabled).toBe(true);
      expect(technical.get('dataSourceSystemId')?.enabled).toBe(true);
    });
  });

  describe('saveChanges', () => {
    async function enterEditMode(): Promise<void> {
      component['enterEditMode']();
      fixture.detectChanges();
      await fixture.whenStable();
    }

    it('should only open the confirmation modal without patching', async () => {
      fillValidForm(component);
      component['currentDataProductId'].set('ex-id');

      await component['saveChanges']();

      expect(component['showPublishModal']()).toBe(true);
      expect(dataProductService.patchDataProduct).not.toHaveBeenCalled();
    });

    it('should not call patchDataProduct when the form is invalid', async () => {
      await enterEditMode();
      component['currentDataProductId'].set('ex-id');

      await component['confirmPublish']();

      expect(dataProductService.patchDataProduct).not.toHaveBeenCalled();
    });

    it('should not call patchDataProduct when there is no existing id', async () => {
      await enterEditMode();
      fillValidForm(component);

      await component['confirmPublish']();

      expect(dataProductService.patchDataProduct).not.toHaveBeenCalled();
    });

    it('should patch the existing product when the form is valid', async () => {
      dataProductService.patchDataProduct.mockResolvedValue({ id: 'ex-id' } as DataProductDto);
      await enterEditMode();
      fillValidForm(component);
      component['currentDataProductId'].set('ex-id');

      await component['confirmPublish']();

      expect(dataProductService.patchDataProduct).toHaveBeenCalledWith(
        'ex-id',
        expect.anything(),
        undefined,
      );
    });

    it('should navigate to list with refresh=true after a successful patch', async () => {
      const navigateSpy = jest.spyOn(router, 'navigate');
      dataProductService.patchDataProduct.mockResolvedValue({ id: 'ex-id' } as DataProductDto);
      await enterEditMode();
      fillValidForm(component);
      component['currentDataProductId'].set('ex-id');

      await component['confirmPublish']();

      expect(navigateSpy).toHaveBeenCalledWith(['data-products'], {
        state: { [FORCE_RELOAD_DATA_PRODUCTS_STATE_PARAM]: true },
      });
    });

    it('should show a success toast after a successful patch', async () => {
      dataProductService.patchDataProduct.mockResolvedValue({ id: 'ex-id' } as DataProductDto);
      await enterEditMode();
      fillValidForm(component);
      component['currentDataProductId'].set('ex-id');

      await component['confirmPublish']();

      expect(toastService.show).toHaveBeenCalledWith(
        expect.anything(),
        expect.anything(),
        ToastType.Success,
      );
    });

    it('should show an error toast when the patch fails', async () => {
      dataProductService.patchDataProduct.mockRejectedValue(new Error('API error'));
      await enterEditMode();
      fillValidForm(component);
      component['currentDataProductId'].set('ex-id');

      await component['confirmPublish']();

      expect(toastService.show).toHaveBeenCalledWith(
        expect.anything(),
        expect.anything(),
        ToastType.Error,
      );
    });

    it('should set isSaving=false after the patch completes', async () => {
      dataProductService.patchDataProduct.mockResolvedValue({ id: 'ex-id' } as DataProductDto);
      await enterEditMode();
      fillValidForm(component);
      component['currentDataProductId'].set('ex-id');

      await component['confirmPublish']();

      expect(component['isSaving']()).toBe(false);
    });

    it('should stay on the documents tab and not navigate when documents are unready', async () => {
      const navigateSpy = jest.spyOn(router, 'navigate');
      dataProductService.patchDataProduct.mockResolvedValue({ id: 'ex-id' } as DataProductDto);
      jest.spyOn(component['uploadStore'], 'hasUnreadyDocuments').mockReturnValue(true);
      await enterEditMode();
      fillValidForm(component);
      component['currentDataProductId'].set('ex-id');

      await component['confirmPublish']();

      expect(component['activeTabId']()).toBe(FORM_TAB_IDS.LINKS_DOCUMENTS);
      expect(navigateSpy).not.toHaveBeenCalled();
    });
  });

  describe('saveDraft', () => {
    it('should call createDataProduct when no existing id', async () => {
      const savedProduct = { id: 'new-id' } as DataProductDto;
      dataProductService.createDataProduct.mockResolvedValue(savedProduct);

      await component['saveDraft']();

      expect(dataProductService.createDataProduct).toHaveBeenCalled();
    });

    it('should update currentDataProductId after create', async () => {
      const savedProduct = { id: 'new-id' } as DataProductDto;
      dataProductService.createDataProduct.mockResolvedValue(savedProduct);

      await component['saveDraft']();

      expect(component['currentDataProductId']()).toBe('new-id');
    });

    it('should set refreshListNeeded=true after save', async () => {
      const savedProduct = { id: 'saved-id' } as DataProductDto;
      dataProductService.createDataProduct.mockResolvedValue(savedProduct);

      await component['saveDraft']();

      expect(component['refreshListNeeded']()).toBe(true);
    });

    it('should call updateDataProduct when existing id is set', async () => {
      const savedProduct = { id: 'ex-id' } as DataProductDto;
      dataProductService.updateDataProduct.mockResolvedValue(savedProduct);
      component['currentDataProductId'].set('ex-id');

      await component['saveDraft']();

      expect(dataProductService.updateDataProduct).toHaveBeenCalledWith(
        'ex-id',
        expect.anything(),
        undefined,
      );
    });

    it('should show success toast on save', async () => {
      dataProductService.createDataProduct.mockResolvedValue({ id: 'saved-id' } as DataProductDto);

      await component['saveDraft']();

      expect(toastService.show).toHaveBeenCalledWith(
        expect.anything(),
        expect.anything(),
        ToastType.Success,
      );
    });

    it('should show error toast when createDataProduct fails', async () => {
      dataProductService.createDataProduct.mockRejectedValue(new Error('API error'));

      await component['saveDraft']();

      expect(toastService.show).toHaveBeenCalledWith(
        expect.anything(),
        expect.anything(),
        ToastType.Error,
      );
    });

    it('should set isSaving=false after successful save', async () => {
      dataProductService.createDataProduct.mockResolvedValue({ id: 'saved-id' } as DataProductDto);

      await component['saveDraft']();

      expect(component['isSaving']()).toBe(false);
    });

    it('should set isSaving=false after failed save', async () => {
      dataProductService.createDataProduct.mockRejectedValue(new Error('API error'));

      await component['saveDraft']();

      expect(component['isSaving']()).toBe(false);
    });

    it('should update URL via location.replaceState after create', async () => {
      const location = TestBed.inject(Location);
      const replaceStateSpy = jest.spyOn(location, 'replaceState');
      dataProductService.createDataProduct.mockResolvedValue({ id: 'saved-id' } as DataProductDto);

      await component['saveDraft']();

      expect(replaceStateSpy).toHaveBeenCalledWith('data-products/saved-id');
    });
  });

  describe('saveAndPublish', () => {
    it('should set publishAttempted=true', () => {
      component['saveAndPublish']();
      expect(component['publishAttempted']()).toBe(true);
    });

    it('should mark all form controls as touched', () => {
      component['saveAndPublish']();
      expect(component['form'].touched).toBe(true);
    });

    it('should not open the publish modal when form is invalid', () => {
      // form has required dataSourceSystemId, so it is invalid by default
      component['saveAndPublish']();
      expect(component['showPublishModal']()).toBe(false);
    });

    it('should not call createDataProduct when form is invalid', () => {
      component['saveAndPublish']();
      expect(dataProductService.createDataProduct).not.toHaveBeenCalled();
    });

    it('should open the publish modal when form is valid', () => {
      fillValidForm(component);

      component['saveAndPublish']();

      expect(component['showPublishModal']()).toBe(true);
    });

    it('should not publish directly when form is valid', () => {
      fillValidForm(component);

      component['saveAndPublish']();

      expect(dataProductService.createDataProduct).not.toHaveBeenCalled();
      expect(dataProductService.setDataProductStatus).not.toHaveBeenCalled();
    });
  });

  describe('cancelPublish', () => {
    it('should close the publish modal', () => {
      component['showPublishModal'].set(true);

      component['cancelPublish']();

      expect(component['showPublishModal']()).toBe(false);
    });

    it('should not publish', () => {
      component['showPublishModal'].set(true);

      component['cancelPublish']();

      expect(dataProductService.createDataProduct).not.toHaveBeenCalled();
      expect(dataProductService.setDataProductStatus).not.toHaveBeenCalled();
    });
  });

  describe('confirmPublish', () => {
    it('should close the publish modal', async () => {
      const savedProduct = { id: 'pub-id' } as DataProductDto;
      dataProductService.createDataProduct.mockResolvedValue(savedProduct);
      dataProductService.setDataProductStatus.mockResolvedValue(savedProduct);
      fillValidForm(component);
      component['showPublishModal'].set(true);

      await component['confirmPublish']();

      expect(component['showPublishModal']()).toBe(false);
    });

    it('should call setDataProductStatus when form is valid and product is created', async () => {
      const savedProduct = { id: 'pub-id' } as DataProductDto;
      dataProductService.createDataProduct.mockResolvedValue(savedProduct);
      dataProductService.setDataProductStatus.mockResolvedValue(savedProduct);
      fillValidForm(component);

      await component['confirmPublish']();

      expect(dataProductService.setDataProductStatus).toHaveBeenCalledWith(
        'pub-id',
        expect.any(String),
        undefined,
      );
    });

    it('should navigate to list with refresh=true after publish', async () => {
      const navigateSpy = jest.spyOn(router, 'navigate');
      const savedProduct = { id: 'pub-id' } as DataProductDto;
      dataProductService.createDataProduct.mockResolvedValue(savedProduct);
      dataProductService.setDataProductStatus.mockResolvedValue(savedProduct);
      fillValidForm(component);

      await component['confirmPublish']();

      expect(navigateSpy).toHaveBeenCalledWith(['data-products'], {
        state: { [FORCE_RELOAD_DATA_PRODUCTS_STATE_PARAM]: true },
      });
    });

    it('should show success toast after publish', async () => {
      const savedProduct = { id: 'pub-id' } as DataProductDto;
      dataProductService.createDataProduct.mockResolvedValue(savedProduct);
      dataProductService.setDataProductStatus.mockResolvedValue(savedProduct);
      fillValidForm(component);

      await component['confirmPublish']();

      expect(toastService.show).toHaveBeenCalledWith(
        expect.anything(),
        expect.anything(),
        ToastType.Success,
      );
    });

    it('should show error toast when publish fails', async () => {
      dataProductService.createDataProduct.mockRejectedValue(new Error('API error'));
      fillValidForm(component);

      await component['confirmPublish']();

      expect(toastService.show).toHaveBeenCalledWith(
        expect.anything(),
        expect.anything(),
        ToastType.Error,
      );
    });

    it('should set isSaving=false after successful publish', async () => {
      const savedProduct = { id: 'pub-id' } as DataProductDto;
      dataProductService.createDataProduct.mockResolvedValue(savedProduct);
      dataProductService.setDataProductStatus.mockResolvedValue(savedProduct);
      fillValidForm(component);

      await component['confirmPublish']();

      expect(component['isSaving']()).toBe(false);
    });

    it('should set isSaving=false after failed publish', async () => {
      dataProductService.createDataProduct.mockRejectedValue(new Error('API error'));
      fillValidForm(component);

      await component['confirmPublish']();

      expect(component['isSaving']()).toBe(false);
    });
  });
});
