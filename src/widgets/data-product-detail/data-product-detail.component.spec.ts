import { HttpErrorResponse, HttpStatusCode } from '@angular/common/http';
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
import {
  createMockErrorHandlerService,
  createMockI18nService,
  MockErrorHandlerService,
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
  let errorService: MockErrorHandlerService;

  beforeEach(async () => {
    URL.createObjectURL = vi.fn().mockReturnValue('blob:mock');
    URL.revokeObjectURL = vi.fn();

    source = {
      downloadDocument: vi.fn().mockResolvedValue(new Blob()),
      getProduct: vi.fn().mockResolvedValue(product()),
      isPublic: true,
      listDocuments: vi.fn().mockResolvedValue([]),
    };

    i18nService = createMockI18nService();
    errorService = createMockErrorHandlerService();

    await TestBed.configureTestingModule({
      imports: [DataProductDetailComponent, createTranslocoTestingModule()],
      providers: [
        { provide: ErrorHandlerService, useValue: errorService },
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

  describe('load error', () => {
    it('reports the error once and shows the error outlet instead of the spinner', async () => {
      const error = new Error('not found');
      source.getProduct.mockRejectedValue(error);
      source.listDocuments.mockRejectedValue(error);
      componentRef.setInput('productId', 'unknown');
      fixture.detectChanges();
      await fixture.whenStable();
      fixture.detectChanges();

      expect(errorService.handleError).toHaveBeenCalledTimes(1);
      expect(errorService.handleError).toHaveBeenCalledWith(error);
      expect(component['product']()).toBeUndefined();
      expect(component['documents']()).toHaveLength(0);
      expect(fixture.nativeElement.querySelector('app-error-outlet')).not.toBeNull();
      expect(fixture.nativeElement.textContent).not.toContain('product.notFound.title');
      expect(fixture.nativeElement.querySelector('fa-icon')).toBeNull();
    });

    it('shows the not-found state without reporting an error for a 404', async () => {
      const notFound = new HttpErrorResponse({ status: HttpStatusCode.NotFound });
      source.getProduct.mockRejectedValue(notFound);
      source.listDocuments.mockRejectedValue(notFound);
      componentRef.setInput('productId', 'unknown');
      fixture.detectChanges();
      await fixture.whenStable();
      fixture.detectChanges();

      expect(component['notFound']()).toBe(true);
      expect(errorService.handleError).not.toHaveBeenCalled();
      expect(fixture.nativeElement.textContent).toContain('product.notFound.title');
      expect(
        fixture.nativeElement.querySelector('app-error-outlet app-error-alert-list'),
      ).toBeNull();
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

  describe('tabs', () => {
    const load = async (id = 'product-1'): Promise<void> => {
      componentRef.setInput('productId', id);
      fixture.detectChanges();
      await fixture.whenStable();
      fixture.detectChanges();
    };

    const openTechnicalTab = (): void => {
      const technicalTab: HTMLButtonElement =
        fixture.nativeElement.querySelectorAll('[role="tab"]')[1];
      technicalTab.click();
      fixture.detectChanges();
    };

    it('switches to the technical tab content', async () => {
      await load();

      openTechnicalTab();

      expect(
        fixture.nativeElement.querySelector('app-data-product-detail-technical'),
      ).not.toBeNull();
      expect(fixture.nativeElement.querySelector('app-data-product-detail-general')).toBeNull();
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

    it('shows only the general content without tabs for a non-public source', async () => {
      componentRef.setInput('source', { ...source, isPublic: false });
      await load();

      expect(fixture.nativeElement.querySelectorAll('[role="tab"]')).toHaveLength(0);
      expect(fixture.nativeElement.querySelector('app-data-product-detail-technical')).toBeNull();
      expect(fixture.nativeElement.querySelector('app-data-product-detail-general')).not.toBeNull();
    });
  });
});
