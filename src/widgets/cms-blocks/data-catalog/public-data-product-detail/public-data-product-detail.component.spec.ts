import { ComponentRef } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DataProductDocumentService } from '@/entities/api/data-product-document.service';
import { DataProductService } from '@/entities/api/data-product.service';
import {
  DataProductDocumentMetadataDto,
  DocumentScanStatusEnum,
  PublicDataProductDto,
} from '@/entities/openapi';
import { ErrorHandlerService } from '@/shared/error/error-handler.service';
import { I18nService } from '@/shared/i18n';
import {
  createMockDataProductDocumentService,
  createMockDataProductService,
  createMockErrorHandlerService,
  createMockI18nService,
  MockDataProductDocumentService,
  MockDataProductService,
} from '@/shared/testing/mocks';
import { createTranslocoTestingModule } from '@/shared/testing/transloco-testing.module';

import { PublicDataProductDetailComponent } from './public-data-product-detail.component';

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

describe('PublicDataProductDetailComponent', () => {
  let fixture: ComponentFixture<PublicDataProductDetailComponent>;
  let component: PublicDataProductDetailComponent;
  let componentRef: ComponentRef<PublicDataProductDetailComponent>;
  let dataProductService: MockDataProductService;
  let documentService: MockDataProductDocumentService;

  beforeEach(async () => {
    URL.createObjectURL = vi.fn().mockReturnValue('blob:mock');
    URL.revokeObjectURL = vi.fn();

    dataProductService = createMockDataProductService();
    dataProductService.getPublicProductById.mockResolvedValue(product());
    documentService = createMockDataProductDocumentService();

    await TestBed.configureTestingModule({
      imports: [PublicDataProductDetailComponent, createTranslocoTestingModule()],
      providers: [
        { provide: DataProductService, useValue: dataProductService },
        { provide: DataProductDocumentService, useValue: documentService },
        { provide: ErrorHandlerService, useValue: createMockErrorHandlerService() },
        { provide: I18nService, useValue: createMockI18nService() },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PublicDataProductDetailComponent);
    component = fixture.componentInstance;
    componentRef = fixture.componentRef;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  describe('documents', () => {
    it('is empty when the resource has no value', async () => {
      componentRef.setInput('productId', 'product-1');
      fixture.detectChanges();
      await fixture.whenStable();

      expect(component['documents']()).toHaveLength(0);
    });

    it('exposes and renders the loaded document metadata', async () => {
      documentService.listDocumentsPublic.mockResolvedValue([doc('doc-1'), doc('doc-2')]);
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
      dataProductService.getPublicProductById.mockResolvedValue({ ...product(), links: [] });
      componentRef.setInput('productId', 'product-1');
      fixture.detectChanges();
      await fixture.whenStable();

      expect(component['hasLinks']()).toBe(false);
    });
  });

  describe('handleDownload', () => {
    it('downloads the document through the public endpoint', async () => {
      componentRef.setInput('productId', 'product-1');
      fixture.detectChanges();
      await fixture.whenStable();

      component['handleDownload'](doc('doc-1'));
      await fixture.whenStable();

      expect(documentService.downloadDocumentPublic).toHaveBeenCalledWith('product-1', 'doc-1');
    });

    it('does nothing when there is no product id', () => {
      fixture.detectChanges();

      component['handleDownload'](doc('doc-1'));

      expect(documentService.downloadDocumentPublic).not.toHaveBeenCalled();
    });
  });

  describe('handleOpen', () => {
    it('opens the document through the public endpoint', async () => {
      const openSpy = vi.spyOn(globalThis, 'open').mockImplementation(() => null);
      componentRef.setInput('productId', 'product-1');
      fixture.detectChanges();
      await fixture.whenStable();

      component['handleOpen'](doc('doc-1'));
      await fixture.whenStable();

      expect(documentService.downloadDocumentPublic).toHaveBeenCalledWith('product-1', 'doc-1');
      openSpy.mockRestore();
    });

    it('does nothing when there is no product id', () => {
      fixture.detectChanges();

      component['handleOpen'](doc('doc-1'));

      expect(documentService.downloadDocumentPublic).not.toHaveBeenCalled();
    });
  });
});
