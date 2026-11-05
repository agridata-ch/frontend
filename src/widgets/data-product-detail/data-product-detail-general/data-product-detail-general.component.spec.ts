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

import { DataProductDetailGeneralComponent } from './data-product-detail-general.component';

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

describe('DataProductDetailGeneralComponent', () => {
  let fixture: ComponentFixture<DataProductDetailGeneralComponent>;
  let component: DataProductDetailGeneralComponent;
  let componentRef: ComponentRef<DataProductDetailGeneralComponent>;
  let source: Mocked<DataProductSource>;

  beforeEach(async () => {
    URL.createObjectURL = vi.fn().mockReturnValue('blob:mock');
    URL.revokeObjectURL = vi.fn();

    source = {
      downloadDocument: vi.fn().mockResolvedValue(new Blob()),
      getProduct: vi.fn(),
      listDocuments: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [DataProductDetailGeneralComponent, createTranslocoTestingModule()],
      providers: [
        { provide: ErrorHandlerService, useValue: createMockErrorHandlerService() },
        { provide: I18nService, useValue: createMockI18nService() },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DataProductDetailGeneralComponent);
    component = fixture.componentInstance;
    componentRef = fixture.componentRef;
    componentRef.setInput('product', product());
    componentRef.setInput('source', source);
    fixture.detectChanges();
  });

  it('renders one download entry per document', () => {
    componentRef.setInput('documents', [doc('doc-1'), doc('doc-2')]);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelectorAll('app-agridata-file-download')).toHaveLength(2);
  });

  describe('hasLinks', () => {
    it('is true when the product has links', () => {
      expect(component['hasLinks']()).toBe(true);
    });

    it('is false when the product has no links', () => {
      componentRef.setInput('product', { ...product(), links: [] });

      expect(component['hasLinks']()).toBe(false);
    });
  });

  describe('pricingBasis', () => {
    it('is empty when no payment is required', () => {
      componentRef.setInput('product', { ...product(), pricingBasis: { de: 'CHF 10' } });

      expect(component['pricingBasis']()).toBe('');
    });
  });

  it('downloads the document through the source', async () => {
    component['handleDownload'](doc('doc-1'));
    await fixture.whenStable();

    expect(source.downloadDocument).toHaveBeenCalledWith('product-1', 'doc-1');
  });

  it('opens the document through the source', async () => {
    const openSpy = vi.spyOn(globalThis, 'open').mockImplementation(() => null);

    component['handleOpen'](doc('doc-1'));
    await fixture.whenStable();

    expect(source.downloadDocument).toHaveBeenCalledWith('product-1', 'doc-1');
    openSpy.mockRestore();
  });
});
