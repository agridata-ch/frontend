import { ComponentRef } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import type { Mocked } from 'vitest';

import { DataProductSource } from '@/entities/api';
import {
  DataProductDocumentMetadataDto,
  DocumentScanStatusEnum,
  FlowCodeEnum,
  PublicDataProductDto,
} from '@/entities/openapi';
import { ErrorHandlerService } from '@/shared/error/error-handler.service';
import { I18nService } from '@/shared/i18n';
import {
  createMockErrorHandlerService,
  createMockI18nService,
  MockI18nService,
} from '@/shared/testing/mocks';
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
  let i18nService: MockI18nService;

  beforeEach(async () => {
    URL.createObjectURL = vi.fn().mockReturnValue('blob:mock');
    URL.revokeObjectURL = vi.fn();

    source = {
      downloadDocument: vi.fn().mockResolvedValue(new Blob()),
      getProduct: vi.fn().mockResolvedValue(product()),
      listDocuments: vi.fn().mockResolvedValue([]),
    };

    i18nService = createMockI18nService();

    await TestBed.configureTestingModule({
      imports: [DataProductDetailComponent, createTranslocoTestingModule()],
      providers: [
        { provide: ErrorHandlerService, useValue: createMockErrorHandlerService() },
        { provide: I18nService, useValue: i18nService },
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

  describe('tabs', () => {
    const load = async (id = 'product-1'): Promise<void> => {
      componentRef.setInput('productId', id);
      fixture.detectChanges();
      await fixture.whenStable();
      fixture.detectChanges();
    };

    const openTechnicalTab = (): string => {
      const technicalTab: HTMLButtonElement =
        fixture.nativeElement.querySelectorAll('[role="tab"]')[1];
      technicalTab.click();
      fixture.detectChanges();
      return fixture.nativeElement.textContent;
    };

    it('shows the id, flow code and templates on the technical tab', async () => {
      source.getProduct.mockResolvedValue({
        ...product(),
        flowCode: FlowCodeEnum.BurBasedPreValidation,
        restClientPathTemplate: '/api/{{bur}}',
        restClientRequestTemplate: '{ "a": 1 }',
      });
      await load();

      const text = openTechnicalTab();

      expect(text).toContain('product-1');
      expect(text).toContain(FlowCodeEnum.BurBasedPreValidation);
      expect(text).toContain('/api/{{bur}}');
      expect(text).toContain('{ "a": 1 }');
      expect(fixture.nativeElement.querySelector('app-agridata-links-list')).toBeNull();
    });

    it('shows only the id when the optional technical fields are missing', async () => {
      await load();

      const text = openTechnicalTab();

      expect(text).toContain('product.technical.productId');
      expect(text).not.toContain('product.technical.flowCode');
      expect(text).not.toContain('product.technical.pathTemplate');
      expect(text).not.toContain('product.technical.requestTemplate');
    });

    it('resets to the general tab when another product is selected', async () => {
      await load();
      component['activeTabId'].set('technical');

      await load('product-2');

      expect(component['activeTabId']()).toBe('general');
    });

    it('re-translates the tab labels when the language changes', async () => {
      i18nService.translate.mockImplementation((key: string) => `${i18nService.lang()}:${key}`);
      await load();

      i18nService.setActiveLang('fr');
      fixture.detectChanges();

      expect(fixture.nativeElement.textContent).toContain(
        'fr:data-products.detailForm.tab.technicalFields',
      );
    });
  });
});
