import { ComponentRef } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import type { Mocked } from 'vitest';

import { DataProductSource } from '@/entities/api';
import {
  DataProductDocumentMetadataDto,
  DocumentScanStatusEnum,
  PublicDataProductDto,
} from '@/entities/openapi';
import { ErrorHandlerService } from '@/shared/error/error-handler.service';
import { I18nService } from '@/shared/i18n';
import { createMockErrorHandlerService, createMockI18nService } from '@/shared/testing/mocks';
import { createTranslocoTestingModule } from '@/shared/testing/transloco-testing.module';

import { DataProductDetailComponent } from './data-product-detail.component';

const doc = (id: string): DataProductDocumentMetadataDto => ({
  id,
  fileName: `${id}.pdf`,
  scanStatus: DocumentScanStatusEnum.Available,
  sizeBytes: 50,
});

const product = (): PublicDataProductDto => ({
  id: 'product-1',
  paymentRequired: false,
  consentRequired: false,
  stateCode: 'ACTIVE' as PublicDataProductDto['stateCode'],
  name: { de: 'Produkt' },
  links: [{ displayText: 'Link', url: 'https://example.test' }],
});

describe('DataProductDetailComponent', () => {
  let fixture: ComponentFixture<DataProductDetailComponent>;
  let component: DataProductDetailComponent;
  let componentRef: ComponentRef<DataProductDetailComponent>;
  let source: Mocked<DataProductSource>;

  beforeEach(async () => {
    URL.createObjectURL = vi.fn().mockReturnValue('blob:mock');
    URL.revokeObjectURL = vi.fn();

    source = {
      downloadDocument: vi.fn().mockResolvedValue(new Blob()),
      getProduct: vi.fn().mockResolvedValue(product()),
      listDocuments: vi.fn().mockResolvedValue([]),
    };

    await TestBed.configureTestingModule({
      imports: [DataProductDetailComponent, createTranslocoTestingModule()],
      providers: [
        { provide: ErrorHandlerService, useValue: createMockErrorHandlerService() },
        { provide: I18nService, useValue: createMockI18nService() },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DataProductDetailComponent);
    component = fixture.componentInstance;
    componentRef = fixture.componentRef;
    componentRef.setInput('source', source);
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  describe('handleNameLoaded', () => {
    it('emits the translated product name once the product is loaded', async () => {
      const names: string[] = [];
      component.handleNameLoaded.subscribe((name) => names.push(name));
      componentRef.setInput('productId', 'product-1');
      fixture.detectChanges();
      await fixture.whenStable();

      expect(names.at(-1)).toBe('Produkt');
    });
  });

  describe('documents', () => {
    it('is empty when the resource has no value', async () => {
      componentRef.setInput('productId', 'product-1');
      fixture.detectChanges();
      await fixture.whenStable();

      expect(component['documents']()).toHaveLength(0);
    });

    it('exposes and renders the loaded document metadata', async () => {
      source.listDocuments.mockResolvedValue([doc('doc-1'), doc('doc-2')]);
      componentRef.setInput('productId', 'product-1');
      fixture.detectChanges();
      await fixture.whenStable();
      fixture.detectChanges();

      expect(component['documents']()).toHaveLength(2);
      expect(fixture.nativeElement.querySelectorAll('app-agridata-file-download')).toHaveLength(2);
    });
  });

  describe('hasLinks', () => {
    it('is true when the product has links', async () => {
      componentRef.setInput('productId', 'product-1');
      fixture.detectChanges();
      await fixture.whenStable();

      expect(component['hasLinks']()).toBe(true);
    });

    it('is false when the product has no links', async () => {
      source.getProduct.mockResolvedValue({ ...product(), links: [] });
      componentRef.setInput('productId', 'product-1');
      fixture.detectChanges();
      await fixture.whenStable();

      expect(component['hasLinks']()).toBe(false);
    });
  });

  describe('handleDownload', () => {
    it('downloads the document through the source', async () => {
      componentRef.setInput('productId', 'product-1');
      fixture.detectChanges();
      await fixture.whenStable();

      component['handleDownload'](doc('doc-1'));
      await fixture.whenStable();

      expect(source.downloadDocument).toHaveBeenCalledWith('product-1', 'doc-1');
    });

    it('does nothing when there is no product id', () => {
      fixture.detectChanges();

      component['handleDownload'](doc('doc-1'));

      expect(source.downloadDocument).not.toHaveBeenCalled();
    });
  });

  describe('handleOpen', () => {
    it('opens the document through the source', async () => {
      const openSpy = vi.spyOn(globalThis, 'open').mockImplementation(() => null);
      componentRef.setInput('productId', 'product-1');
      fixture.detectChanges();
      await fixture.whenStable();

      component['handleOpen'](doc('doc-1'));
      await fixture.whenStable();

      expect(source.downloadDocument).toHaveBeenCalledWith('product-1', 'doc-1');
      openSpy.mockRestore();
    });

    it('does nothing when there is no product id', () => {
      fixture.detectChanges();

      component['handleOpen'](doc('doc-1'));

      expect(source.downloadDocument).not.toHaveBeenCalled();
    });
  });
});
