import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ErrorHandlerService } from '@/app/error/error-handler.service';
import { AgridataStateService } from '@/entities/api/agridata-state.service';
import { DataProductService } from '@/entities/api/data-product.service';
import { DataProductDto, DataProductDtoStateCode } from '@/entities/openapi';
import { I18nService } from '@/shared/i18n';
import {
  createMockAgridataStateService,
  createMockDataProductService,
  createMockErrorHandlerService,
  createMockI18nService,
  createMockToastService,
  MockDataProductService,
  MockErrorHandlerService,
  MockToastService,
} from '@/shared/testing/mocks';
import { createTranslocoTestingModule } from '@/shared/testing/transloco-testing.module';
import { ToastService, ToastType } from '@/shared/toast';

import { DataProductsDeleteModalComponent } from './data-products-delete-modal.component';

describe('DataProductsDeleteModalComponent', () => {
  let fixture: ComponentFixture<DataProductsDeleteModalComponent>;
  let component: DataProductsDeleteModalComponent;
  let dataProductService: MockDataProductService;
  let errorService: MockErrorHandlerService;
  let toastService: MockToastService;

  const createProduct = (stateCode: DataProductDtoStateCode): DataProductDto => ({
    id: 'product-1',
    stateCode,
    consentRequired: false,
    name: { de: 'Test Product' },
    dataSourceSystem: {
      id: 'system-1',
      dataProvider: { id: 'provider-1' },
      name: { de: 'System A' },
      legalBasis: { de: 'Rechtsgrundlage' },
    },
  });

  beforeEach(async () => {
    dataProductService = createMockDataProductService();
    errorService = createMockErrorHandlerService();
    toastService = createMockToastService();

    await TestBed.configureTestingModule({
      imports: [DataProductsDeleteModalComponent, createTranslocoTestingModule()],
      providers: [
        { provide: AgridataStateService, useValue: createMockAgridataStateService() },
        { provide: DataProductService, useValue: dataProductService },
        { provide: ErrorHandlerService, useValue: errorService },
        { provide: I18nService, useValue: createMockI18nService() },
        { provide: ToastService, useValue: toastService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DataProductsDeleteModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('creation', () => {
    it('should create the component', () => {
      expect(component).toBeTruthy();
    });
  });

  describe('open state', () => {
    it('should stay closed while no product is set', () => {
      expect(component['isOpen']()).toBe(false);
      expect(component['productName']()).toBe('');
    });

    it('should open and resolve the product name once a product is set', () => {
      fixture.componentRef.setInput('product', createProduct(DataProductDtoStateCode.Draft));

      expect(component['isOpen']()).toBe(true);
      expect(component['productName']()).toBe('Test Product');
    });
  });

  describe('cancelling', () => {
    it('should clear the product without calling the service', () => {
      fixture.componentRef.setInput('product', createProduct(DataProductDtoStateCode.Draft));

      component['cancelDelete']();

      expect(component.product()).toBeNull();
      expect(component['isOpen']()).toBe(false);
      expect(dataProductService.deleteDataProduct).not.toHaveBeenCalled();
    });
  });

  describe('deleting', () => {
    it('should delete the draft product, show a toast and emit handleDeleted', async () => {
      const deleted = jest.fn();
      component.handleDeleted.subscribe(deleted);
      fixture.componentRef.setInput('product', createProduct(DataProductDtoStateCode.Draft));

      await component['deleteProduct']();

      expect(dataProductService.deleteDataProduct).toHaveBeenCalledWith('product-1', undefined);
      expect(toastService.show).toHaveBeenCalledWith(
        'data-products.table.deleteProduct.success.title',
        'data-products.table.deleteProduct.success.message',
        ToastType.Success,
      );
      expect(deleted).toHaveBeenCalled();
      expect(errorService.handleError).not.toHaveBeenCalled();
    });

    it('should reset its state after a successful deletion', async () => {
      fixture.componentRef.setInput('product', createProduct(DataProductDtoStateCode.Draft));

      await component['deleteProduct']();

      expect(component['isDeleting']()).toBe(false);
      expect(component.product()).toBeNull();
    });

    it('should report the error and not emit handleDeleted when the deletion fails', async () => {
      const error = new Error('deletion failed');
      const deleted = jest.fn();
      component.handleDeleted.subscribe(deleted);
      dataProductService.deleteDataProduct.mockRejectedValueOnce(error);
      fixture.componentRef.setInput('product', createProduct(DataProductDtoStateCode.Draft));

      await component['deleteProduct']();

      expect(errorService.handleError).toHaveBeenCalledWith(error);
      expect(toastService.show).not.toHaveBeenCalled();
      expect(deleted).not.toHaveBeenCalled();
      expect(component['isDeleting']()).toBe(false);
      expect(component.product()).toBeNull();
    });

    it('should not delete a product that is no longer a draft', async () => {
      fixture.componentRef.setInput('product', createProduct(DataProductDtoStateCode.Active));

      await component['deleteProduct']();

      expect(dataProductService.deleteDataProduct).not.toHaveBeenCalled();
      expect(component.product()).toBeNull();
    });
  });
});
